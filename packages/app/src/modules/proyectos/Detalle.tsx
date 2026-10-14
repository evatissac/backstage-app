import { ReactNode } from 'react';
import {
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
  useParams,
} from 'react-router-dom';
import {
  Alert,
  Avatar,
  ButtonLink,
  Cell,
  CellText,
  Skeleton,
  Text,
} from '@backstage/ui';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import WidgetsIcon from '@material-ui/icons/WidgetsOutlined';
import DocIcon from '@material-ui/icons/DescriptionOutlined';
import GroupIcon from '@material-ui/icons/GroupOutlined';
import LinkIcon from '@material-ui/icons/LaunchOutlined';
import SearchOffIcon from '@material-ui/icons/SearchOutlined';
import { textosHrl } from '../idioma';
import { EstadoVacio } from '../comun/EstadoVacio';
import { IconoTipo } from '../comun/iconos';
import {
  colorProyecto,
  Entidad,
  partesRef,
  relaciones,
  rutaDocs,
  rutaEntidad,
  tieneDocs,
  tituloDe,
} from '../comun/entidades';
import { DetalleProyecto, useDetalleProyecto } from './datos';
import { agruparPorCapa } from '../comun/tecnologias';
import {
  PestanaArquitectura,
  PestanaDespliegue,
  PestanaDocumentos,
  PestanaProcesos,
  PestanaTecnologias,
} from './PestanasFicha';
import { ResumenCalidad, TablaCalidad, useCalidad } from '../calidad';
import { TablaHRL } from '../comun/TablaHRL';
import { Etiqueta, estiloCiclo } from '../comun/Etiqueta';
import { Migas } from '../comun/Migas';
import './proyectos.css';

const specDe = (e: Entidad) =>
  (e.spec ?? {}) as { type?: string; lifecycle?: string; owner?: string };

const responsablesDe = (e: Entidad) =>
  relaciones(e, 'ownedBy')
    .map(r => partesRef(r).name)
    .join(', ');

/**
 * Componentes, APIs y recursos del proyecto en una sola tabla. El nombre es
 * el enlace a su ficha y la última columna repite el acceso como botón.
 */
const TablaPiezas = (props: { entidades: Entidad[]; vacio: ReactNode }) => {
  const { t } = useTranslationRef(textosHrl);
  const clase = (e: Entidad) => {
    const k = e.kind.toLowerCase();
    return k === 'component' || k === 'api' || k === 'resource'
      ? t(`proyecto.clase.${k}` as const)
      : e.kind;
  };
  return (
    <TablaHRL
      id="proyecto-piezas"
      titulo={t('proyecto.pestanaPiezas')}
      filas={props.entidades.map(e => ({
        id: e.metadata.uid ?? `${e.kind}:${e.metadata.name}`,
        e,
      }))}
      vacio={props.vacio}
      agruparPorDefecto="clase"
      columnas={[
        {
          id: 'nombre',
          etiqueta: t('proyecto.columnaNombre'),
          principal: true,
          valor: ({ e }) => tituloDe(e),
          celda: ({ e }) => (
            <CellText
              title={tituloDe(e)}
              description={e.metadata.description}
              href={rutaEntidad(e)}
              leadingIcon={<IconoTipo tipo={e.kind} />}
            />
          ),
        },
        {
          id: 'clase',
          etiqueta: t('proyecto.columnaClase'),
          filtrable: true,
          agrupable: true,
          valor: ({ e }) => clase(e),
          celda: ({ e }) => <CellText title={clase(e)} />,
        },
        {
          id: 'tipo',
          etiqueta: t('proyecto.columnaTipo'),
          filtrable: true,
          agrupable: true,
          valor: ({ e }) => specDe(e).type ?? '',
          celda: ({ e }) => <CellText title={specDe(e).type ?? '—'} />,
        },
        {
          id: 'ciclo',
          etiqueta: t('proyecto.columnaCiclo'),
          filtrable: true,
          agrupable: true,
          valor: ({ e }) => specDe(e).lifecycle ?? '',
          celda: ({ e }) => {
            const ciclo = specDe(e).lifecycle;
            return ciclo ? (
              <Cell>
                <Etiqueta texto={ciclo} {...estiloCiclo(ciclo)} />
              </Cell>
            ) : (
              <CellText title="—" />
            );
          },
        },
        {
          id: 'responsable',
          etiqueta: t('proyecto.columnaResponsable'),
          filtrable: true,
          agrupable: true,
          valor: ({ e }) => responsablesDe(e),
          celda: ({ e }) => <CellText title={responsablesDe(e) || '—'} />,
        },
        {
          id: 'docs',
          etiqueta: t('proyecto.columnaDocs'),
          filtrable: true,
          valor: ({ e }) =>
            tieneDocs(e) ? t('proyecto.conDocs') : t('proyecto.sinDocs'),
          celda: ({ e }) =>
            tieneDocs(e) ? (
              <CellText
                title={t('proyecto.abrirDocs')}
                href={rutaDocs(e)}
                leadingIcon={<DocIcon />}
              />
            ) : (
              <CellText title={t('proyecto.sinDocs')} color="secondary" />
            ),
        },
      ]}
      acciones={({ e }) => (
        <ButtonLink
          href={rutaEntidad(e)}
          variant="tertiary"
          size="small"
          aria-label={t('proyecto.abrirFicha', { nombre: tituloDe(e) })}
        >
          {t('proyecto.abrir')}
        </ButtonLink>
      )}
    />
  );
};

/** Tecnologías del proyecto agrupadas por capa, a partir de las etiquetas. */
const Stack = (props: { entidades: Entidad[]; base: string }) => {
  const { entidades } = props;
  const { t } = useTranslationRef(textosHrl);
  const grupos = agruparPorCapa(entidades.flatMap(e => e.metadata.tags ?? []));
  if (grupos.size === 0) return null;
  return (
    <section className="hrl-tarjeta">
      <Text as="h2" variant="title-x-small" weight="bold">
        {t('proyecto.stack')}
      </Text>
      <dl className="hrl-capas">
        {[...grupos].map(([capa, tecnologias]) => (
          <div key={capa} className="hrl-capas__fila">
            <dt>{t(`proyecto.capas.${capa}` as const)}</dt>
            <dd className="hrl-stack">
              {tecnologias.map(tec => (
                <span key={tec} className="hrl-stack__item">
                  {tec}
                </span>
              ))}
            </dd>
          </div>
        ))}
      </dl>
      <Text as="p" variant="body-x-small" color="secondary">
        {t('proyecto.stackNota')}
      </Text>
      <Link
        to={`${props.base}/ficha/tecnologias`}
        className="hrl-enlace-flecha"
      >
        {t('proyecto.verTecnologias')}
      </Link>
    </section>
  );
};

const Resumen = ({ d }: { d: DetalleProyecto }) => {
  const { t } = useTranslationRef(textosHrl);
  const documentados = [...d.componentes, ...d.apis].filter(tieneDocs).length;
  const enlaces = d.sistema.metadata.links ?? [];
  const etiquetas = d.sistema.metadata.tags ?? [];
  const cifras = [
    { valor: d.componentes.length, etiqueta: t('proyectos.componentes') },
    { valor: d.apis.length, etiqueta: t('proyectos.apis') },
    { valor: documentados, etiqueta: t('proyectos.documentos') },
    { valor: d.miembros.length, etiqueta: t('proyecto.personas') },
  ];
  return (
    <div className="hrl-resumen">
      <div className="hrl-seccion">
        <div className="hrl-cifras">
          {cifras.map(c => (
            <div key={c.etiqueta} className="hrl-cifra">
              <span className="hrl-cifra__valor">{c.valor}</span>
              <span className="hrl-cifra__etiqueta">{c.etiqueta}</span>
            </div>
          ))}
        </div>
        <Stack
          entidades={[...d.componentes, ...d.apis, ...d.recursos]}
          base={`/proyectos/${d.sistema.metadata.name}`}
        />
        {d.componentes.length === 0 && d.apis.length === 0 && (
          <EstadoVacio
            icono={<WidgetsIcon />}
            titulo={t('proyecto.sinPiezasTitulo')}
            descripcion={t('proyecto.sinPiezasDescripcion')}
          />
        )}
      </div>

      <aside className="hrl-tarjeta">
        <Text as="h2" variant="title-x-small" weight="bold">
          {t('proyecto.acerca')}
        </Text>
        <Text as="p" variant="body-small" color="secondary">
          {d.sistema.metadata.description ?? t('proyectos.sinDescripcion')}
        </Text>
        {etiquetas.length > 0 && (
          <span style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {etiquetas.map(e => (
              <span key={e} className="hrl-chip">
                {e}
              </span>
            ))}
          </span>
        )}
        {enlaces.length > 0 && (
          <ul className="hrl-lista">
            {enlaces.map(l => (
              <li key={l.url}>
                <a
                  className="hrl-lista__item"
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <LinkIcon aria-hidden />
                  <span className="hrl-lista__texto">
                    <Text variant="body-small" weight="bold">
                      {l.title ?? l.url}
                    </Text>
                    <Text variant="body-x-small" color="secondary">
                      {l.url.replace(/^https?:\/\//, '')}
                    </Text>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
        <ButtonLink
          href={rutaEntidad(d.sistema)}
          variant="secondary"
          size="small"
        >
          {t('proyecto.verEnCatalogo')}
        </ButtonLink>
      </aside>
    </div>
  );
};

const DocsTecnicos = ({ d }: { d: DetalleProyecto }) => {
  const { t } = useTranslationRef(textosHrl);
  const documentos = [d.sistema, ...d.componentes, ...d.apis].filter(tieneDocs);
  if (documentos.length === 0) {
    return (
      <EstadoVacio
        compacto
        icono={<DocIcon />}
        titulo={t('proyecto.sinDocsTitulo')}
        descripcion={t('proyecto.sinDocsDescripcion')}
      />
    );
  }
  return (
    <div className="hrl-proyectos-rejilla">
      {documentos.map(e => (
        <Link key={e.metadata.name} to={rutaDocs(e)} className="hrl-tarjeta">
          <span className="hrl-vacio__icono" aria-hidden>
            <DocIcon />
          </span>
          <Text as="h3" variant="title-x-small" weight="bold">
            {tituloDe(e)}
          </Text>
          <Text as="p" variant="body-small" color="secondary">
            {e.metadata.description ?? t('proyectos.sinDescripcion')}
          </Text>
        </Link>
      ))}
    </div>
  );
};

/**
 * Documentación técnica (TechDocs de cada pieza) y, debajo, los documentos
 * institucionales del proyecto (ficha.json). Antes eran dos pestañas.
 */
const Documentacion = ({ d }: { d: DetalleProyecto }) => {
  const { t } = useTranslationRef(textosHrl);
  return (
    <div className="hrl-seccion">
      <section className="hrl-seccion" aria-labelledby="hrl-docs-tecnicos">
        <div className="hrl-intro">
          <Text
            as="h2"
            id="hrl-docs-tecnicos"
            variant="title-small"
            weight="bold"
          >
            {t('proyecto.docsTecnicos')}
          </Text>
          <Text as="p" variant="body-small" color="secondary">
            {t('proyecto.docsTecnicosAyuda')}
          </Text>
        </div>
        <DocsTecnicos d={d} />
      </section>
      <section
        className="hrl-seccion"
        aria-labelledby="hrl-docs-institucionales"
      >
        <div className="hrl-intro">
          <Text
            as="h2"
            id="hrl-docs-institucionales"
            variant="title-small"
            weight="bold"
          >
            {t('proyecto.docsInstitucionales')}
          </Text>
          <Text as="p" variant="body-small" color="secondary">
            {t('proyecto.docsInstitucionalesAyuda')}
          </Text>
        </div>
        <PestanaDocumentos sistema={d.sistema.metadata.name} />
      </section>
    </div>
  );
};

const Equipo = ({ d }: { d: DetalleProyecto }) => {
  const { t } = useTranslationRef(textosHrl);
  const nombreEquipo = d.responsable
    ? tituloDe(d.responsable)
    : t('proyecto.sinResponsable');
  if (d.miembros.length === 0) {
    return (
      <EstadoVacio
        icono={<GroupIcon />}
        titulo={t('proyecto.sinMiembrosTitulo', { equipo: nombreEquipo })}
        descripcion={t('proyecto.sinMiembrosDescripcion')}
      />
    );
  }
  return (
    <div className="hrl-seccion">
      <Text as="h2" variant="title-x-small" weight="bold">
        {nombreEquipo}
      </Text>
      <div className="hrl-personas">
        {d.miembros.map(m => {
          const perfil = (
            m.spec as {
              profile?: {
                displayName?: string;
                picture?: string;
                email?: string;
              };
            }
          )?.profile;
          const nombre = perfil?.displayName ?? m.metadata.name;
          return (
            <Link
              key={m.metadata.name}
              to={rutaEntidad(m)}
              className="hrl-tarjeta hrl-persona"
            >
              <Avatar
                src={perfil?.picture ?? ''}
                name={nombre}
                purpose="decoration"
              />
              <span className="hrl-lista__texto">
                <Text variant="body-medium" weight="bold">
                  {nombre}
                </Text>
                <Text variant="body-x-small" color="secondary">
                  @{m.metadata.name}
                </Text>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

const CalidadProyecto = ({ nombre }: { nombre: string }) => {
  const carga = useCalidad(nombre);
  return (
    <div className="hrl-seccion">
      {carga.estado === 'listo' && carga.datos.length > 0 && (
        <ResumenCalidad datos={carga.datos} />
      )}
      <TablaCalidad carga={carga} />
    </div>
  );
};

const SECCIONES_FICHA = [
  'arquitectura',
  'tecnologias',
  'despliegue',
  'procesos',
] as const;

/**
 * Ficha técnica: una sola pestaña con sus cuatro secciones como
 * subnavegación, para que la fila de pestañas no se desborde.
 */
const FichaTecnica = (props: { base: string; sistema: string }) => {
  const { t } = useTranslationRef(textosHrl);
  const titulos = {
    arquitectura: t('proyecto.pestanaArquitectura'),
    tecnologias: t('proyecto.pestanaTecnologias'),
    despliegue: t('proyecto.pestanaDespliegue'),
    procesos: t('proyecto.pestanaProcesos'),
  };
  return (
    <div className="hrl-seccion">
      <nav className="hrl-subnav" aria-label={t('proyecto.seccionesFicha')}>
        {SECCIONES_FICHA.map(s => (
          <NavLink key={s} to={`${props.base}/ficha/${s}`}>
            {titulos[s]}
          </NavLink>
        ))}
      </nav>
      <Routes>
        <Route index element={<Navigate to="arquitectura" replace />} />
        <Route
          path="arquitectura"
          element={<PestanaArquitectura sistema={props.sistema} />}
        />
        <Route
          path="tecnologias"
          element={<PestanaTecnologias sistema={props.sistema} />}
        />
        <Route
          path="despliegue"
          element={<PestanaDespliegue sistema={props.sistema} />}
        />
        <Route
          path="procesos"
          element={<PestanaProcesos sistema={props.sistema} />}
        />
        <Route path="*" element={<Navigate to="arquitectura" replace />} />
      </Routes>
    </div>
  );
};

const Pestanas = (props: { base: string; d: DetalleProyecto }) => {
  const { t } = useTranslationRef(textosHrl);
  const { d } = props;
  const documentos = [d.sistema, ...d.componentes, ...d.apis].filter(tieneDocs);
  const pestanas = [
    { ruta: '', texto: t('proyecto.pestanaResumen') },
    { ruta: 'ficha', texto: t('proyecto.pestanaFicha') },
    {
      ruta: 'componentes',
      texto: t('proyecto.pestanaPiezas'),
      cuenta: d.componentes.length + d.apis.length + d.recursos.length,
    },
    {
      ruta: 'documentacion',
      texto: t('proyecto.pestanaDocumentacion'),
      cuenta: documentos.length,
    },
    {
      ruta: 'equipo',
      texto: t('proyecto.pestanaEquipo'),
      cuenta: d.miembros.length,
    },
    { ruta: 'calidad', texto: t('proyecto.pestanaCalidad') },
  ];
  return (
    <nav className="hrl-pestanas" aria-label={t('proyecto.secciones')}>
      {pestanas.map(p => (
        <NavLink
          key={p.ruta}
          to={p.ruta ? `${props.base}/${p.ruta}` : props.base}
          // La ficha técnica tiene subrutas: su pestaña sigue activa en ellas.
          end={p.ruta !== 'ficha'}
        >
          {p.texto}
          {p.cuenta !== undefined && (
            <span className="hrl-pestanas__cuenta">{p.cuenta}</span>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export const Detalle = () => {
  const { t } = useTranslationRef(textosHrl);
  const { nombre = '' } = useParams();
  const detalle = useDetalleProyecto(nombre);

  if (detalle.estado === 'cargando') {
    return (
      <div aria-busy>
        <Skeleton width="100%" height={220} />
        <div className="hrl-pagina">
          <Skeleton width="100%" height={160} />
        </div>
      </div>
    );
  }
  if (detalle.estado === 'error') {
    return (
      <div className="hrl-pagina">
        <Alert
          status="danger"
          icon
          title={t('proyecto.errorCarga')}
          description={detalle.error.message}
        />
      </div>
    );
  }
  const d = detalle.datos;
  if (!d) {
    return (
      <div className="hrl-pagina">
        <EstadoVacio
          icono={<SearchOffIcon />}
          titulo={t('proyecto.noExisteTitulo', { nombre })}
          descripcion={t('proyecto.noExisteDescripcion')}
          accion={
            <ButtonLink href="/proyectos" variant="secondary">
              {t('proyecto.volver')}
            </ButtonLink>
          }
        />
      </div>
    );
  }

  const color = colorProyecto(d.sistema);
  const titulo = tituloDe(d.sistema);
  const base = `/proyectos/${d.sistema.metadata.name}`;
  const repositorio = d.sistema.metadata.links?.[0];

  return (
    <div
      className="hrl-subportal"
      style={{ ['--hrl-proyecto' as string]: color }}
    >
      <section className="hrl-identidad hrl-subportal__heroe">
        <Migas
          claro
          migas={[
            { texto: t('paginas.proyectos'), href: '/proyectos' },
            { texto: titulo },
          ]}
        />
        <span className="hrl-identidad__equipo">
          {d.dominio ? tituloDe(d.dominio) : t('proyectos.titulo')}
        </span>
        <h1>{titulo}</h1>
        {d.sistema.metadata.description && (
          <p className="hrl-subportal__desc">
            {d.sistema.metadata.description}
          </p>
        )}
        <dl className="hrl-subportal__meta">
          <div>
            <dt>{t('proyecto.responsable')}</dt>
            <dd>
              {d.responsable ? (
                <Link to={rutaEntidad(d.responsable)}>
                  {tituloDe(d.responsable)}
                </Link>
              ) : (
                t('proyecto.sinResponsable')
              )}
            </dd>
          </div>
          {d.dominio && (
            <div>
              <dt>{t('proyecto.dominio')}</dt>
              <dd>
                <Link to={rutaEntidad(d.dominio)}>{tituloDe(d.dominio)}</Link>
              </dd>
            </div>
          )}
          {repositorio && (
            <div>
              <dt>{repositorio.title ?? t('proyecto.enlace')}</dt>
              <dd>
                <a
                  href={repositorio.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {repositorio.url.replace(
                    /^https?:\/\/(www\.)?github\.com\//,
                    '',
                  )}
                </a>
              </dd>
            </div>
          )}
        </dl>
      </section>

      <Pestanas base={base} d={d} />

      <div className="hrl-pagina">
        <Routes>
          <Route path="" element={<Resumen d={d} />} />
          <Route
            path="ficha/*"
            element={
              <FichaTecnica base={base} sistema={d.sistema.metadata.name} />
            }
          />
          {/* Rutas de antes de agrupar pestañas: los enlaces guardados siguen sirviendo. */}
          {SECCIONES_FICHA.map(s => (
            <Route
              key={s}
              path={s}
              element={<Navigate to={`${base}/ficha/${s}`} replace />}
            />
          ))}
          <Route
            path="apis"
            element={<Navigate to={`${base}/componentes`} replace />}
          />
          <Route
            path="documentos"
            element={<Navigate to={`${base}/documentacion`} replace />}
          />
          <Route
            path="componentes"
            element={
              <TablaPiezas
                entidades={[...d.componentes, ...d.apis, ...d.recursos]}
                vacio={
                  <EstadoVacio
                    icono={<WidgetsIcon />}
                    titulo={t('proyecto.sinComponentesTitulo')}
                    descripcion={t('proyecto.sinComponentesDescripcion')}
                  />
                }
              />
            }
          />
          <Route path="documentacion" element={<Documentacion d={d} />} />
          <Route path="equipo" element={<Equipo d={d} />} />
          <Route
            path="calidad"
            element={<CalidadProyecto nombre={d.sistema.metadata.name} />}
          />
        </Routes>
      </div>
    </div>
  );
};
