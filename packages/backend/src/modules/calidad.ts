import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { CatalogClient } from '@backstage/catalog-client';
import {
  FactRetriever,
  FactRetrieverContext,
  techInsightsFactRetrieversExtensionPoint,
} from '@backstage-community/plugin-tech-insights-node';

/**
 * Datos para las comprobaciones de calidad del portal (Bronce, Plata, Oro).
 * Tech Insights los guarda con su fecha, así que la calidad tiene historial
 * y no se recalcula en el navegador de cada persona.
 *
 * - `hrlCatalogo`: lo que dice la ficha de cada componente o API.
 * - `hrlRepositorio`: lo que hay dentro de su repositorio (README, CODEOWNERS,
 *   archivos de credenciales, versión del kit).
 *
 * Las reglas que usan estos datos están en app-config.yaml
 * (techInsights.factChecker.checks) y su texto en el frontend
 * (modules/calidad).
 */

type Entidad = Awaited<
  ReturnType<CatalogClient['getEntities']>
>['items'][number];

const COMPONENTES_Y_APIS = [{ kind: ['component', 'api'] }];

const refEntidad = (e: Entidad) => ({
  namespace: e.metadata.namespace ?? 'default',
  kind: e.kind,
  name: e.metadata.name,
});

const relaciones = (e: Entidad, tipo: string) =>
  (e.relations ?? []).filter(r => r.type === tipo).map(r => r.targetRef);

const leerEntidades = async (ctx: FactRetrieverContext) => {
  const { token } = await ctx.auth.getPluginRequestToken({
    onBehalfOf: await ctx.auth.getOwnServiceCredentials(),
    targetPluginId: 'catalog',
  });
  const catalogo = new CatalogClient({ discoveryApi: ctx.discovery });
  const leer = (filter: FactRetrieverContext['entityFilter']) =>
    catalogo.getEntities({ filter }, { token }).then(r => r.items);
  return { leer };
};

const catalogo: FactRetriever = {
  id: 'hrlCatalogo',
  version: '2.0.0',
  title: 'Ficha del catálogo',
  description: 'Lo que declara la ficha de cada componente y API.',
  entityFilter: COMPONENTES_Y_APIS,
  schema: {
    tieneProyecto: { type: 'boolean', description: 'Pertenece a un System.' },
    descripcionSuficiente: {
      type: 'boolean',
      description: 'La descripción tiene al menos 10 caracteres.',
    },
    tieneDocs: { type: 'boolean', description: 'Publica TechDocs.' },
    tieneRepositorio: {
      type: 'boolean',
      description: 'Declara dónde está su código.',
    },
    tieneCicloDeVida: { type: 'boolean', description: 'Tiene spec.lifecycle.' },
    tieneEtiquetas: { type: 'boolean', description: 'Tiene metadata.tags.' },
    enProduccion: {
      type: 'boolean',
      description: 'spec.lifecycle es production.',
    },
  },
  handler: async ctx => {
    const { leer } = await leerEntidades(ctx);
    const entidades = await leer(ctx.entityFilter ?? COMPONENTES_Y_APIS);
    return entidades.map(e => {
      const spec = (e.spec ?? {}) as { system?: string; lifecycle?: string };
      const anotaciones = e.metadata.annotations ?? {};
      return {
        entity: refEntidad(e),
        facts: {
          tieneProyecto:
            Boolean(spec.system) ||
            relaciones(e, 'partOf').some(r => r.startsWith('system:')),
          descripcionSuficiente:
            (e.metadata.description ?? '').trim().length >= 10,
          tieneDocs: Boolean(
            anotaciones['backstage.io/techdocs-ref'] ||
              anotaciones['backstage.io/techdocs-entity'],
          ),
          tieneRepositorio: Boolean(
            anotaciones['backstage.io/source-location'] ||
              anotaciones['github.com/project-slug'],
          ),
          tieneCicloDeVida: Boolean(spec.lifecycle),
          tieneEtiquetas: (e.metadata.tags ?? []).length > 0,
          enProduccion: spec.lifecycle === 'production',
        },
      };
    });
  },
};

// Nombres de archivo que no deberían estar versionados nunca.
const CREDENCIALES =
  /(^|\/)(credenciales|credentials|secrets?|passwords?|contrase(n|ñ)as?)(\.[a-z0-9]+)?$|(^|\/)\.env(\.[a-z0-9-]+)?$|\.(pem|p12|pfx|key)$/i;
// Plantillas de variables: no tienen valores reales.
const EJEMPLO = /\.env\.(example|sample|template|ejemplo)$/i;

const urlFuente = (e: Entidad) => {
  const anotacion = e.metadata.annotations?.['backstage.io/source-location'];
  if (anotacion) return anotacion.replace(/^url:/, '');
  const slug = e.metadata.annotations?.['github.com/project-slug'];
  return slug ? `https://github.com/${slug}` : undefined;
};

/** `@hrl/core-ui` fijado a un tag (`#v1.2.3`) en cada package.json que lo use. */
const kitFijado = (paquetes: string[]) => {
  const versiones = paquetes.flatMap(texto => {
    try {
      const pkg = JSON.parse(texto) as Record<string, Record<string, string>>;
      return [pkg.dependencies, pkg.devDependencies]
        .map(d => d?.['@hrl/core-ui'])
        .filter((v): v is string => Boolean(v));
    } catch {
      return [];
    }
  });
  return {
    usaKit: versiones.length > 0,
    kitFijado: versiones.every(v => /#v\d+\.\d+\.\d+/.test(v)),
  };
};

const repositorio: FactRetriever = {
  id: 'hrlRepositorio',
  version: '2.0.0',
  title: 'Contenido del repositorio',
  description:
    'Archivos del repositorio de cada componente y API: README, CODEOWNERS, credenciales y versión del kit.',
  entityFilter: COMPONENTES_Y_APIS,
  schema: {
    tieneReadme: { type: 'boolean', description: 'README en la raíz.' },
    tienePruebas: {
      type: 'boolean',
      description: 'Tiene flujos de GitHub Actions en .github/workflows/.',
    },
    tieneCodeowners: {
      type: 'boolean',
      description: 'CODEOWNERS en la raíz, .github/ o docs/.',
    },
    sinCredenciales: {
      type: 'boolean',
      description: 'Ningún archivo de credenciales o .env versionado.',
    },
    usaKit: { type: 'boolean', description: 'Depende de @hrl/core-ui.' },
    kitFijado: {
      type: 'boolean',
      description: '@hrl/core-ui fijado a un tag, o no lo usa.',
    },
  },
  handler: async ctx => {
    const { leer } = await leerEntidades(ctx);
    const entidades = await leer(ctx.entityFilter ?? COMPONENTES_Y_APIS);

    // Varios componentes pueden compartir repositorio: se lee una vez.
    const porRepo = new Map<string, Entidad[]>();
    for (const e of entidades) {
      const url = urlFuente(e);
      if (url) porRepo.set(url, [...(porRepo.get(url) ?? []), e]);
    }

    const hechos = [];
    for (const [url, delRepo] of porRepo) {
      try {
        const arbol = await ctx.urlReader.readTree(url, {
          // Solo se extrae lo que se va a mirar, no el repositorio entero.
          filter: ruta =>
            !ruta.includes('node_modules/') &&
            (/^(readme(\.\w+)?|codeowners|\.github\/codeowners|docs\/codeowners)$/i.test(
              ruta,
            ) ||
              /(^|\/)package\.json$/.test(ruta) ||
              /^\.github\/workflows\/[^/]+\.ya?ml$/i.test(ruta) ||
              CREDENCIALES.test(ruta)),
        });
        const archivos = await arbol.files();
        const rutas = archivos.map(a => a.path);
        const paquetes = await Promise.all(
          archivos
            .filter(a => /(^|\/)package\.json$/.test(a.path))
            .map(async a => (await a.content()).toString('utf8')),
        );
        const facts = {
          tieneReadme: rutas.some(r => /^readme(\.\w+)?$/i.test(r)),
          tienePruebas: rutas.some(r =>
            /^\.github\/workflows\/[^/]+\.ya?ml$/i.test(r),
          ),
          tieneCodeowners: rutas.some(r =>
            /^(\.github\/|docs\/)?codeowners$/i.test(r),
          ),
          sinCredenciales: !rutas.some(
            r => CREDENCIALES.test(r) && !EJEMPLO.test(r),
          ),
          ...kitFijado(paquetes),
        };
        for (const e of delRepo) hechos.push({ entity: refEntidad(e), facts });
      } catch (error) {
        // Sin acceso al repositorio no se inventa nada: sus comprobaciones
        // quedan «sin evaluar» en el portal.
        ctx.logger.warn(
          `No se pudo leer ${url} para la calidad: ${(error as Error).message}`,
        );
      }
    }
    return hechos;
  },
};

export default createBackendModule({
  pluginId: 'tech-insights',
  moduleId: 'hrl-calidad',
  register(env) {
    env.registerInit({
      deps: {
        retrievers: techInsightsFactRetrieversExtensionPoint,
        logger: coreServices.logger,
      },
      async init({ retrievers, logger }) {
        retrievers.addFactRetrievers({
          hrlCatalogo: catalogo,
          hrlRepositorio: repositorio,
        });
        logger.info('Comprobaciones de calidad del HRL registradas');
      },
    });
  },
});
