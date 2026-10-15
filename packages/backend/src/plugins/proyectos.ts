import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { CatalogClient } from '@backstage/catalog-client';
import { NotAllowedError, NotFoundError } from '@backstage/errors';
import express from 'express';
import Router from 'express-promise-router';
import {
  guardarGrupos,
  leerGrupos,
  prepararTabla,
  validarGrupos,
} from './grupos';

/**
 * Lo que el portal necesita saber de un proyecto y que no está en el
 * catálogo: quién trabaja en sus repositorios, cómo salieron sus pruebas,
 * dónde está su wiki, qué se integró hace poco y cuánto avanzó según su plan.
 *
 * GET /api/proyectos/:sistema/repositorios
 * GET /api/proyectos/:sistema/avance
 *
 * Todo sale de GitHub con el token de la integración, solo con lecturas, y se
 * guarda unos minutos en caché para no gastar el límite de la API.
 */

type Entidad = Awaited<
  ReturnType<CatalogClient['getEntities']>
>['items'][number];

export type Miembro = {
  login: string;
  avatar: string;
  url: string;
  /** admin, maintain, write, triage o read; null si solo se sabe que contribuyó. */
  permiso: string | null;
  contribuciones: number;
};

export type Ejecucion = {
  flujo: string;
  estado: string;
  conclusion: string | null;
  fecha: string;
  rama: string;
  url: string;
};

export type Cambio = {
  titulo: string;
  fecha: string;
  url: string;
  autor: string;
};

export type Repositorio = {
  slug: string;
  url: string;
  descripcion: string | null;
  wiki: string | null;
  ramaPrincipal: string;
  miembros: Miembro[];
  /** Fuente de los miembros: con acceso al repo o solo autores de commits. */
  miembrosSegun: 'colaboradores' | 'contribuidores';
  pruebas: { configuradas: boolean; ejecuciones: Ejecucion[] };
  cambios: Cambio[];
  error?: string;
};

export type Entrega = {
  id: string;
  fase: string;
  texto: string;
  estado: 'completada' | 'pendiente' | 'retirada';
  /** El estado tal como está escrito en el plan («[bloqueado] para…»). */
  detalle: string;
};

export type Avance = {
  fuente: string;
  fases: { titulo: string; estado: string; fecha: string | null }[];
  entregas: Entrega[];
};

// Anotación del System con el documento de plan del que sale el avance.
const ANOTACION_AVANCE = 'hrl/avance';
const MINUTOS_CACHE = 10;

const slugDe = (url: string) => {
  const m = url.match(/github\.com[/:]([^/\s]+)\/([^/\s#?]+)/i);
  return m ? `${m[1]}/${m[2].replace(/\.git$/, '')}` : undefined;
};

/** Repositorios de un proyecto: los del propio System y los de sus piezas. */
const reposDe = (sistema: Entidad, piezas: Entidad[]) => {
  const urls = [
    ...(sistema.metadata.links ?? []).map(l => l.url),
    ...[sistema, ...piezas].flatMap(e => {
      const a = e.metadata.annotations ?? {};
      return [
        a['backstage.io/source-location']?.replace(/^url:/, ''),
        a['github.com/project-slug'] &&
          `https://github.com/${a['github.com/project-slug']}`,
      ].filter((x): x is string => Boolean(x));
    }),
  ];
  return [...new Set(urls.map(slugDe).filter((s): s is string => Boolean(s)))];
};

/**
 * Lee un plan en Markdown con la convención de los repos del hospital:
 * fases como `## Fase 1 — Nombre · **[en curso]**` y entregas como filas
 * `| 12 | Qué se entrega | [hecho] |`. Una fase sin tabla cuenta como una
 * sola entrega.
 */
export const leerPlan = (texto: string, fuente: string): Avance => {
  const fases: Avance['fases'] = [];
  const entregas: Entrega[] = [];
  let fase: string | null = null;
  let filasDeFase = 0;

  const clasificar = (estado: string): Entrega['estado'] => {
    const e = estado.toLowerCase();
    if (/retirad|descartad/.test(e)) return 'retirada';
    // Solo «[hecho]» o «[hecho, 24/09/2026]» es completo; «[hecho para la
    // Fase 0; repetir al cierre]» o «[hecho] … [pendiente]» siguen abiertos.
    const marcas = [...e.matchAll(/\[([^\]]+)\]/g)].map(m => m[1].trim());
    const completa =
      marcas.length > 0 &&
      marcas.every(m => /^hecho(,\s*\d{1,2}\/\d{1,2}\/\d{4})?$/.test(m));
    return completa ? 'completada' : 'pendiente';
  };
  const limpiar = (s: string) => s.replace(/\*\*/g, '').trim();
  const cerrarFase = () => {
    // Una fase sin tabla (p. ej. «Nutrición con carga de Excel · [hecho]»)
    // es en sí misma una entrega.
    if (fase && filasDeFase === 0) {
      const f = fases[fases.length - 1];
      entregas.push({
        id: `fase-${fases.length}`,
        fase: f.titulo,
        texto: f.titulo,
        estado: clasificar(f.estado),
        detalle: f.estado,
      });
    }
  };

  for (const linea of texto.split(/\r?\n/)) {
    const titulo = linea.match(/^##\s+(.+?)\s*·\s*\*\*\[([^\]]+)\]\*\*\s*$/);
    if (titulo) {
      cerrarFase();
      const fecha = titulo[2].match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
      fase = limpiar(titulo[1]);
      filasDeFase = 0;
      fases.push({
        titulo: fase,
        estado: `[${titulo[2]}]`,
        fecha: fecha ? fecha[1] : null,
      });
      continue;
    }
    if (/^##\s/.test(linea)) {
      // Otra sección («Decisiones abiertas»): sus tablas no son entregas.
      cerrarFase();
      fase = null;
      continue;
    }
    const fila = linea.match(
      /^\|\s*(\d+[a-z]?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*$/,
    );
    if (fase && fila) {
      filasDeFase++;
      entregas.push({
        id: fila[1],
        fase,
        texto: limpiar(fila[2]),
        estado: clasificar(fila[3]),
        detalle: limpiar(fila[3]),
      });
    }
  }
  cerrarFase();
  return { fuente, fases, entregas };
};

export default createBackendPlugin({
  pluginId: 'proyectos',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        config: coreServices.rootConfig,
        logger: coreServices.logger,
        discovery: coreServices.discovery,
        auth: coreServices.auth,
        httpAuth: coreServices.httpAuth,
        urlReader: coreServices.urlReader,
        cache: coreServices.cache,
        database: coreServices.database,
        userInfo: coreServices.userInfo,
      },
      async init({
        httpRouter,
        config,
        logger,
        discovery,
        auth,
        httpAuth,
        urlReader,
        cache,
        database,
        userInfo,
      }) {
        const db = await database.getClient();
        await prepararTabla(db as any);
        const token = config
          .getOptionalConfigArray('integrations.github')
          ?.find(g => g.getString('host') === 'github.com')
          ?.getOptionalString('token');
        const catalogo = new CatalogClient({ discoveryApi: discovery });

        const github = async <T>(ruta: string): Promise<T> => {
          const respuesta = await fetch(`https://api.github.com${ruta}`, {
            headers: {
              Accept: 'application/vnd.github+json',
              'X-GitHub-Api-Version': '2022-11-28',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
          if (!respuesta.ok) {
            throw Object.assign(
              new Error(`GitHub ${respuesta.status} en ${ruta}`),
              { estado: respuesta.status },
            );
          }
          return (await respuesta.json()) as T;
        };

        const enCache = async <T>(clave: string, leer: () => Promise<T>) => {
          const guardado = (await cache.get(clave)) as T | undefined;
          if (guardado) return guardado;
          const valor = await leer();
          await cache.set(clave, valor as any, {
            ttl: { minutes: MINUTOS_CACHE },
          });
          return valor;
        };

        const proyecto = async (nombre: string, credenciales: any) => {
          const { token: t } = await auth.getPluginRequestToken({
            onBehalfOf: credenciales,
            targetPluginId: 'catalog',
          });
          const sistema = await catalogo.getEntityByRef(
            { kind: 'system', namespace: 'default', name: nombre },
            { token: t },
          );
          if (!sistema)
            throw new NotFoundError(`No existe el proyecto ${nombre}`);
          const piezas = await catalogo.getEntities(
            {
              filter: {
                'relations.partOf': `system:default/${nombre}`.toLowerCase(),
              },
            },
            { token: t },
          );
          return { sistema, piezas: piezas.items };
        };

        const leerRepo = async (slug: string): Promise<Repositorio> => {
          const base: Repositorio = {
            slug,
            url: `https://github.com/${slug}`,
            descripcion: null,
            wiki: null,
            ramaPrincipal: 'main',
            miembros: [],
            miembrosSegun: 'colaboradores',
            pruebas: { configuradas: false, ejecuciones: [] },
            cambios: [],
          };
          try {
            const info = await github<{
              description: string | null;
              has_wiki: boolean;
              html_url: string;
              default_branch: string;
            }>(`/repos/${slug}`);
            base.descripcion = info.description;
            base.url = info.html_url;
            base.ramaPrincipal = info.default_branch;
            base.wiki = info.has_wiki ? `${info.html_url}/wiki` : null;
          } catch (e) {
            return { ...base, error: (e as Error).message };
          }

          type Persona = {
            login: string;
            avatar_url: string;
            html_url: string;
            type: string;
            role_name?: string;
            contributions?: number;
          };
          const [colaboradores, contribuidores, ejecuciones, prs] =
            await Promise.allSettled([
              github<Persona[]>(`/repos/${slug}/collaborators?per_page=100`),
              github<Persona[]>(`/repos/${slug}/contributors?per_page=100`),
              github<{
                total_count: number;
                workflow_runs: {
                  name: string;
                  status: string;
                  conclusion: string | null;
                  created_at: string;
                  head_branch: string;
                  html_url: string;
                }[];
              }>(`/repos/${slug}/actions/runs?per_page=10`),
              github<
                {
                  title: string;
                  merged_at: string | null;
                  html_url: string;
                  user: { login: string } | null;
                }[]
              >(
                `/repos/${slug}/pulls?state=closed&sort=updated&direction=desc&per_page=20`,
              ),
            ]);

          const aportes = new Map(
            (contribuidores.status === 'fulfilled'
              ? contribuidores.value
              : []
            ).map(p => [p.login, p.contributions ?? 0]),
          );
          // Sin permiso para ver colaboradores, se usan los autores de commits.
          let personas: Persona[] = [];
          if (colaboradores.status === 'fulfilled') {
            personas = colaboradores.value;
          } else if (contribuidores.status === 'fulfilled') {
            personas = contribuidores.value;
          }
          base.miembrosSegun =
            colaboradores.status === 'fulfilled'
              ? 'colaboradores'
              : 'contribuidores';
          base.miembros = personas
            .filter(p => p.type !== 'Bot')
            .map(p => ({
              login: p.login,
              avatar: p.avatar_url,
              url: p.html_url,
              permiso: p.role_name ?? null,
              contribuciones: aportes.get(p.login) ?? 0,
            }))
            .sort((a, b) => b.contribuciones - a.contribuciones);

          if (ejecuciones.status === 'fulfilled') {
            base.pruebas = {
              configuradas: ejecuciones.value.total_count > 0,
              ejecuciones: ejecuciones.value.workflow_runs.map(r => ({
                flujo: r.name,
                estado: r.status,
                conclusion: r.conclusion,
                fecha: r.created_at,
                rama: r.head_branch,
                url: r.html_url,
              })),
            };
          }

          // Lo último integrado: pull requests fusionados y commits de la
          // rama principal, juntos y por fecha. Los commits de fusión se
          // omiten porque el pull request ya los representa.
          const integrados: Cambio[] =
            prs.status === 'fulfilled'
              ? prs.value
                  .filter(p => p.merged_at)
                  .map(p => ({
                    titulo: p.title,
                    fecha: p.merged_at!,
                    url: p.html_url,
                    autor: p.user?.login ?? '',
                  }))
              : [];
          try {
            const commits = await github<
              {
                html_url: string;
                commit: {
                  message: string;
                  author: { name: string; date: string } | null;
                };
                author: { login: string } | null;
              }[]
            >(`/repos/${slug}/commits?per_page=10`);
            integrados.push(
              ...commits
                .filter(c => !/^Merge\b/.test(c.commit.message))
                .map(c => ({
                  titulo: c.commit.message.split('\n')[0],
                  fecha: c.commit.author?.date ?? '',
                  url: c.html_url,
                  autor: c.author?.login ?? c.commit.author?.name ?? '',
                })),
            );
          } catch {
            // Sin commits legibles, quedan solo los pull requests.
          }
          base.cambios = integrados
            .sort((a, b) => b.fecha.localeCompare(a.fecha))
            .slice(0, 10);
          return base;
        };

        const router = Router();
        router.use(express.json());

        router.get('/:sistema/repositorios', async (req, res) => {
          const credenciales = await httpAuth.credentials(req, {
            allow: ['user'],
          });
          const { sistema, piezas } = await proyecto(
            req.params.sistema,
            credenciales,
          );
          const slugs = reposDe(sistema, piezas);
          const repos = await Promise.all(
            slugs.map(s => enCache(`repo:${s}`, () => leerRepo(s))),
          );
          res.json({ repositorios: repos });
        });

        router.get('/:sistema/avance', async (req, res) => {
          const credenciales = await httpAuth.credentials(req, {
            allow: ['user'],
          });
          const { sistema } = await proyecto(req.params.sistema, credenciales);
          const fuente = sistema.metadata.annotations?.[ANOTACION_AVANCE];
          if (!fuente) {
            res.json({ avance: null });
            return;
          }
          try {
            const avance = await enCache(`avance:${fuente}`, async () => {
              const archivo = await urlReader.readUrl(fuente);
              return leerPlan(
                (await archivo.buffer()).toString('utf8'),
                fuente,
              );
            });
            res.json({ avance });
          } catch (e) {
            logger.warn(
              `No se pudo leer el plan ${fuente}: ${(e as Error).message}`,
            );
            res.json({ avance: null, error: (e as Error).message, fuente });
          }
        });

        /** Organizaciones de GitHub dueñas de los repositorios del proyecto. */
        const organizaciones = (slugs: string[]) => [
          ...new Set(slugs.map(s => s.split('/')[0])),
        ];

        /**
         * Quién puede editar los grupos de un proyecto: un administrador de la
         * organización de GitHub dueña de sus repositorios. El invitado, solo
         * fuera de producción (el ingreso como invitado ya está limitado a
         * desarrollo).
         */
        const editor = async (req: express.Request, slugs: string[]) => {
          const credenciales = await httpAuth.credentials(req, {
            allow: ['user'],
          });
          const { userEntityRef } = await userInfo.getUserInfo(credenciales);
          if (userEntityRef === 'user:development/guest') {
            return {
              usuario: 'invitado',
              puede: process.env.NODE_ENV !== 'production',
            };
          }
          const login = userEntityRef.split('/').pop() ?? '';
          const roles = await Promise.all(
            organizaciones(slugs).map(org =>
              enCache(`rol:${org}:${login}`, async () => {
                try {
                  const m = await github<{ role: string; state: string }>(
                    `/orgs/${org}/memberships/${login}`,
                  );
                  return m.state === 'active' ? m.role : 'ninguno';
                } catch {
                  return 'ninguno';
                }
              }),
            ),
          );
          return { usuario: login, puede: roles.includes('admin') };
        };

        router.get('/:sistema/grupos', async (req, res) => {
          const credenciales = await httpAuth.credentials(req, {
            allow: ['user'],
          });
          const { sistema, piezas } = await proyecto(
            req.params.sistema,
            credenciales,
          );
          const quien = await editor(req, reposDe(sistema, piezas));
          res.json({
            ...(await leerGrupos(db as any, sistema.metadata.name)),
            puedeEditar: quien.puede,
          });
        });

        router.put('/:sistema/grupos', async (req, res) => {
          const credenciales = await httpAuth.credentials(req, {
            allow: ['user'],
          });
          const { sistema, piezas } = await proyecto(
            req.params.sistema,
            credenciales,
          );
          const quien = await editor(req, reposDe(sistema, piezas));
          if (!quien.puede) {
            throw new NotAllowedError(
              'Solo un administrador de la organización en GitHub puede editar los grupos',
            );
          }
          const grupos = validarGrupos(req.body);
          await guardarGrupos(
            db as any,
            sistema.metadata.name,
            grupos,
            quien.usuario,
          );
          logger.info(
            `Grupos de ${sistema.metadata.name} actualizados por ${quien.usuario}`,
          );
          res.json({
            ...(await leerGrupos(db as any, sistema.metadata.name)),
            puedeEditar: true,
          });
        });

        /** Personas que se pueden asignar: miembros de la organización. */
        router.get('/:sistema/candidatos', async (req, res) => {
          const credenciales = await httpAuth.credentials(req, {
            allow: ['user'],
          });
          const { sistema, piezas } = await proyecto(
            req.params.sistema,
            credenciales,
          );
          const personas = new Map<
            string,
            { login: string; avatar: string; url: string }
          >();
          for (const org of organizaciones(reposDe(sistema, piezas))) {
            const miembros = await enCache(`miembros:${org}`, async () => {
              try {
                return await github<
                  { login: string; avatar_url: string; html_url: string }[]
                >(`/orgs/${org}/members?per_page=100`);
              } catch {
                return [];
              }
            });
            for (const m of miembros) {
              personas.set(m.login.toLowerCase(), {
                login: m.login,
                avatar: m.avatar_url,
                url: m.html_url,
              });
            }
          }
          res.json({
            candidatos: [...personas.values()].sort((a, b) =>
              a.login.localeCompare(b.login),
            ),
          });
        });

        httpRouter.use(router);
      },
    });
  },
});
