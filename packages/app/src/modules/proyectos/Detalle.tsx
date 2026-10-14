import { ReactNode } from 'react';
import { Link, NavLink, Route, Routes, useParams } from 'react-router-dom';
import {
  Alert,
  Avatar,
  ButtonLink,
  CellText,
  Skeleton,
  Table,
  Text,
} from '@backstage/ui';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import WidgetsIcon from '@material-ui/icons/WidgetsOutlined';
import ApiIcon from '@material-ui/icons/SettingsEthernetOutlined';
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
import './proyectos.css';

const specDe = (e: Entidad) =>
  (e.spec ?? {}) as { type?: string; lifecycle?: string; owner?: string };

/** Tabla de componentes o APIs: el nombre es el enlace a su ficha. */
const TablaEntidades = (props: { entidades: Entidad[]; vacio: ReactNode }) => {
  const { t } = useTranslationRef(textosHrl);
  if (props.entidades.length === 0) return <>{props.vacio}</>;
  const filas = props.entidades.map(e => ({
    id: e.metadata.uid ?? e.metadata.name,
    e,
  }));
  return (
    <Table
      data={filas}
      pagination={{ type: 'none' }}
      columnConfig={[
        {
          id: 'nombre',
          label: t('proyecto.columnaNombre'),
          isRowHeader: true,
          cell: ({ e }) => (
            <CellText
              title={tituloDe(e)}
              description={e.metadata.description}
              href={rutaEntidad(e)}
              leadingIcon={<IconoTipo tipo={e.kind} />}
            />
          ),
        },
        {
          id: 'tipo',
          label: t('proyecto.columnaTipo'),
          cell: ({ e }) => <CellText title={specDe(e).type ?? '—'} />,
        },
        {
          id: 'ciclo',
          label: t('proyecto.columnaCiclo'),
          cell: ({ e }) => <CellText title={specDe(e).lifecycle ?? '—'} />,
        },
        {
          id: 'responsable',
          label: t('proyecto.columnaResponsable'),
          cell: ({ e }) => (
            <CellText
              title={
                relaciones(e, 'ownedBy')
                  .map(r => partesRef(r).name)
                  .join(', ') || '—'
              }
            />
          ),
        },
        {
          id: 'docs',
          label: t('proyecto.columnaDocs'),
          cell: ({ e }) =>
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
      <Link to={`${props.base}/tecnologias`} className="hrl-enlace-flecha">
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

const Documentacion = ({ d }: { d: DetalleProyecto }) => {
  const { t } = useTranslationRef(textosHrl);
  const documentos = [d.sistema, ...d.componentes, ...d.apis].filter(tieneDocs);
  if (documentos.length === 0) {
    return (
      <EstadoVacio
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

const Pestanas = (props: { base: string; d: DetalleProyecto }) => {
  const { t } = useTranslationRef(textosHrl);
  const { d } = props;
  const documentos = [d.sistema, ...d.componentes, ...d.apis].filter(tieneDocs);
  const pestanas = [
    { ruta: '', texto: t('proyecto.pestanaResumen') },
    { ruta: 'arquitectura', texto: t('proyecto.pestanaArquitectura') },
    { ruta: 'tecnologias', texto: t('proyecto.pestanaTecnologias') },
    { ruta: 'despliegue', texto: t('proyecto.pestanaDespliegue') },
    { ruta: 'procesos', texto: t('proyecto.pestanaProcesos') },
    {
      ruta: 'componentes',
      texto: t('proyecto.pestanaComponentes'),
      cuenta: d.componentes.length,
    },
    { ruta: 'apis', texto: t('proyecto.pestanaApis'), cuenta: d.apis.length },
    {
      ruta: 'documentacion',
      texto: t('proyecto.pestanaDocumentacion'),
      cuenta: documentos.length,
    },
    { ruta: 'documentos', texto: t('proyecto.pestanaDocumentos') },
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
          end
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
            path="arquitectura"
            element={<PestanaArquitectura sistema={d.sistema.metadata.name} />}
          />
          <Route
            path="tecnologias"
            element={<PestanaTecnologias sistema={d.sistema.metadata.name} />}
          />
          <Route
            path="despliegue"
            element={<PestanaDespliegue sistema={d.sistema.metadata.name} />}
          />
          <Route
            path="procesos"
            element={<PestanaProcesos sistema={d.sistema.metadata.name} />}
          />
          <Route
            path="documentos"
            element={<PestanaDocumentos sistema={d.sistema.metadata.name} />}
          />
          <Route
            path="componentes"
            element={
              <TablaEntidades
                entidades={d.componentes}
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
          <Route
            path="apis"
            element={
              <TablaEntidades
                entidades={d.apis}
                vacio={
                  <EstadoVacio
                    icono={<ApiIcon />}
                    titulo={t('proyecto.sinApisTitulo')}
                    descripcion={t('proyecto.sinApisDescripcion')}
                  />
                }
              />
            }
          />
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
