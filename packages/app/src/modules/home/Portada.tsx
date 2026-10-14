import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ButtonLink,
  Cell,
  CellText,
  SearchField,
  Skeleton,
  Text,
} from '@backstage/ui';
import {
  identityApiRef,
  useApi,
  useTranslationRef,
} from '@backstage/frontend-plugin-api';
import {
  catalogApiRef,
  useStarredEntities,
} from '@backstage/plugin-catalog-react';
import { visitsApiRef } from '@backstage/plugin-home';
import FolderIcon from '@material-ui/icons/FolderSpecialOutlined';
import CatalogIcon from '@material-ui/icons/AppsOutlined';
import DocIcon from '@material-ui/icons/MenuBookOutlined';
import AccionIcon from '@material-ui/icons/FlashOnOutlined';
import TareaIcon from '@material-ui/icons/AssignmentTurnedInOutlined';
import StarIcon from '@material-ui/icons/StarBorderOutlined';
import HistoryIcon from '@material-ui/icons/HistoryOutlined';
import ShieldIcon from '@material-ui/icons/VerifiedUserOutlined';
import ArrowIcon from '@material-ui/icons/ArrowForward';
import { textosHrl } from '../idioma';
import { Carga, useCarga } from '../comun/useCarga';
import { EstadoVacio } from '../comun/EstadoVacio';
import { IconoTipo } from '../comun/iconos';
import {
  partesRef,
  relaciones,
  rutaEntidad,
  tituloDe,
} from '../comun/entidades';
import { Cifra } from '../comun/Cifra';
import { TablaHRL } from '../comun/TablaHRL';
import { RejillaProyectos } from '../proyectos';
import { ListaPrimerosPasos } from '../guia';
import { Insignia, useCalidad } from '../calidad';
import { textoRegla } from '../calidad/componentes';
import { pendientes, Resultado } from '../calidad/reglas';
import { ResumenCatalogo, useResumenCatalogo } from '../proyectos/datos';
import '../comun/comun.css';
import './portada.css';

const saludo = (hora: number) => {
  if (hora < 12) return 'portada.saludoManana' as const;
  if (hora < 19) return 'portada.saludoTarde' as const;
  return 'portada.saludoNoche' as const;
};

const Panel = (props: {
  titulo: string;
  icono: ReactNode;
  children: ReactNode;
}) => (
  <section className="hrl-tarjeta hrl-panel">
    <h2 className="hrl-panel__titulo">
      <span aria-hidden>{props.icono}</span>
      <Text variant="title-x-small" weight="bold">
        {props.titulo}
      </Text>
    </h2>
    {props.children}
  </section>
);

const CargandoLista = () => (
  <div className="hrl-lista" aria-busy>
    {[0, 1, 2].map(i => (
      <Skeleton key={i} width="100%" height={36} style={{ margin: '4px 0' }} />
    ))}
  </div>
);

/**
 * Héroe compacto: saludo y búsqueda en una franja. Las cifras salen a su
 * propia fila para que lo importante quede a la vista sin desplazarse.
 */
const Heroe = () => {
  const { t } = useTranslationRef(textosHrl);
  const navigate = useNavigate();
  const identityApi = useApi(identityApiRef);
  const perfil = useCarga(() => identityApi.getProfileInfo(), [identityApi]);
  const nombre =
    perfil.estado === 'listo'
      ? (perfil.datos.displayName ?? '').split(' ')[0]
      : '';

  return (
    <section className="hrl-heroe hrl-heroe--compacto">
      <div className="hrl-heroe__contenido">
        <p className="hrl-heroe__antetitulo">{t('portal.title')}</p>
        <h1 className="hrl-heroe__titulo">
          {nombre
            ? t(saludo(new Date().getHours()), { nombre })
            : t('portada.saludoSinNombre')}
        </h1>
      </div>
      <div className="hrl-heroe__busqueda">
        <SearchField
          aria-label={t('portada.buscarEtiqueta')}
          placeholder={t('portada.buscarPlaceholder')}
          onSubmit={valor =>
            navigate(`/search?query=${encodeURIComponent(valor)}`)
          }
        />
        <p className="hrl-heroe__pista">{t('portada.buscarPista')}</p>
      </div>
    </section>
  );
};

/** Porcentaje, o null si no hay nada que medir: 0 de 0 no es 0 %. */
const porcentaje = (parte: number, total: number) =>
  total === 0 ? null : `${Math.round((parte / total) * 100)} %`;

/** Cifras del catálogo, cada una con lo que cuenta exactamente. */
const Cifras = ({ resumen }: { resumen: Carga<ResumenCatalogo> }) => {
  const { t } = useTranslationRef(textosHrl);
  const calidad = useCalidad();
  const r = resumen.estado === 'listo' ? resumen.datos : undefined;
  const piezas = r ? r.componentes + r.apis : 0;
  const documentadas = r
    ? r.proyectos.reduce((n, p) => n + p.documentos, 0)
    : 0;
  const conBronce =
    calidad.estado === 'listo'
      ? porcentaje(
          calidad.datos.filter(d => d.nivel).length,
          calidad.datos.length,
        )
      : null;
  return (
    <div className="hrl-cifras2 hrl-portada__cifras">
      <Cifra
        icono={<FolderIcon />}
        etiqueta={t('portada.cifraProyectos')}
        ayuda={t('portada.ayudaProyectos')}
        valor={r?.proyectos.length}
        cargando={!r}
        href="/proyectos"
      />
      <Cifra
        icono={<CatalogIcon />}
        etiqueta={t('portada.cifraPiezas')}
        ayuda={t('portada.ayudaPiezas')}
        valor={r ? piezas : undefined}
        cargando={!r}
        href="/catalog"
      />
      <Cifra
        icono={<DocIcon />}
        etiqueta={t('portada.cifraDocumentadas')}
        ayuda={t('portada.ayudaDocumentadas')}
        valor={r ? porcentaje(documentadas, piezas) : undefined}
        cargando={!r}
        href="/docs"
      />
      <Cifra
        icono={<ShieldIcon />}
        etiqueta={t('portada.cifraBronce')}
        ayuda={t('portada.ayudaBronce')}
        valor={conBronce}
        cargando={calidad.estado === 'cargando'}
        href="/calidad"
      />
    </div>
  );
};

/**
 * «Pendiente para ti»: los componentes y APIs de tus equipos que aún no
 * llegan a Oro, con lo siguiente que les falta. Es la tabla de trabajo de la
 * portada, como la cola de revisión de Port.
 */
const Pendiente = () => {
  const { t } = useTranslationRef(textosHrl);
  const identityApi = useApi(identityApiRef);
  const identidad = useCarga(
    () => identityApi.getBackstageIdentity(),
    [identityApi],
  );
  const calidad = useCalidad();
  const propios = new Set(
    identidad.estado === 'listo'
      ? identidad.datos.ownershipEntityRefs.map(r => r.toLowerCase())
      : [],
  );
  const filas =
    calidad.estado === 'listo' && identidad.estado === 'listo'
      ? calidad.datos
          .filter(
            r =>
              r.nivel !== 'oro' &&
              relaciones(r.entidad, 'ownedBy').some(o =>
                propios.has(o.toLowerCase()),
              ),
          )
          .map(r => ({
            id: r.entidad.metadata.uid ?? r.entidad.metadata.name,
            r,
          }))
      : undefined;
  const sinEquipo =
    identidad.estado === 'listo' &&
    !identidad.datos.ownershipEntityRefs.some(r => r.startsWith('group:'));
  const siguientes = (r: Resultado) =>
    pendientes(r)
      .map(regla => textoRegla(t, regla.id, 'titulo'))
      .join(' · ');

  return (
    <Panel titulo={t('portada.pendiente')} icono={<TareaIcon />}>
      <Text as="p" variant="body-small" color="secondary">
        {t('portada.pendienteAyuda')}
      </Text>
      {calidad.estado === 'error' ? (
        <Text variant="body-small" color="danger">
          {calidad.error.message}
        </Text>
      ) : (
        <TablaHRL
          id="portada-pendiente"
          titulo={t('portada.pendiente')}
          filas={filas}
          cargando={!filas}
          porPagina={5}
          vacio={
            <EstadoVacio
              compacto
              icono={<TareaIcon />}
              titulo={
                sinEquipo
                  ? t('portada.pendienteSinEquipoTitulo')
                  : t('portada.pendienteVacioTitulo')
              }
              descripcion={
                sinEquipo
                  ? t('portada.pendienteSinEquipoDescripcion')
                  : t('portada.pendienteVacioDescripcion')
              }
            />
          }
          columnas={[
            {
              id: 'nombre',
              etiqueta: t('proyecto.columnaNombre'),
              principal: true,
              valor: ({ r }) => tituloDe(r.entidad),
              celda: ({ r }) => (
                <CellText
                  title={tituloDe(r.entidad)}
                  href={rutaEntidad(r.entidad)}
                  leadingIcon={<IconoTipo tipo={r.entidad.kind} />}
                />
              ),
            },
            {
              id: 'nivel',
              etiqueta: t('calidad.columnaNivel'),
              filtrable: true,
              valor: ({ r }) => {
                if (r.sinEvaluar) return t('calidad.sinEvaluar');
                return r.nivel
                  ? t(`calidad.nivel.${r.nivel}` as const)
                  : t('calidad.sinNivel');
              },
              celda: ({ r }) => (
                <Cell>
                  <Insignia nivel={r.nivel} sinEvaluar={r.sinEvaluar} />
                </Cell>
              ),
            },
            {
              id: 'siguiente',
              etiqueta: t('calidad.columnaSiguiente'),
              valor: ({ r }) => siguientes(r),
              celda: ({ r }) => <CellText title={siguientes(r)} />,
            },
          ]}
          acciones={({ r }) => (
            <ButtonLink
              href={`${rutaEntidad(r.entidad)}/calidad`}
              variant="tertiary"
              size="small"
              aria-label={t('portada.verQueFalta', {
                nombre: tituloDe(r.entidad),
              })}
            >
              {t('portada.queFalta')}
            </ButtonLink>
          )}
        />
      )}
    </Panel>
  );
};

const Acceso = (props: {
  href: string;
  icono: ReactNode;
  titulo: string;
  texto: string;
}) => (
  <Link to={props.href} className="hrl-tarjeta hrl-acceso">
    <span className="hrl-acceso__icono" aria-hidden>
      {props.icono}
    </span>
    <span className="hrl-acceso__texto">
      <Text variant="body-medium" weight="bold">
        {props.titulo}
      </Text>
      <Text variant="body-small" color="secondary">
        {props.texto}
      </Text>
    </span>
    <ArrowIcon className="hrl-acceso__flecha" aria-hidden />
  </Link>
);

const Accesos = () => {
  const { t } = useTranslationRef(textosHrl);
  return (
    <div className="hrl-accesos">
      <Acceso
        href="/proyectos"
        icono={<FolderIcon />}
        titulo={t('paginas.proyectos')}
        texto={t('portada.accesoProyectos')}
      />
      <Acceso
        href="/catalog"
        icono={<CatalogIcon />}
        titulo={t('paginas.catalog')}
        texto={t('portada.accesoCatalogo')}
      />
      <Acceso
        href="/docs"
        icono={<DocIcon />}
        titulo={t('paginas.techdocs')}
        texto={t('portada.accesoDocs')}
      />
      <Acceso
        href="/autoservicio"
        icono={<AccionIcon />}
        titulo={t('paginas.autoservicio')}
        texto={t('portada.accesoAutoservicio')}
      />
    </div>
  );
};

const Favoritos = () => {
  const { t } = useTranslationRef(textosHrl);
  const catalogo = useApi(catalogApiRef);
  const { starredEntities } = useStarredEntities();
  const refs = [...starredEntities];
  const clave = refs.join('|');
  const entidades = useCarga(
    async () =>
      refs.length
        ? (await catalogo.getEntitiesByRefs({ entityRefs: refs })).items
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `clave` resume `refs`.
    [catalogo, clave],
  );

  return (
    <Panel titulo={t('portada.favoritos')} icono={<StarIcon />}>
      {entidades.estado === 'cargando' && <CargandoLista />}
      {entidades.estado === 'listo' &&
        (entidades.datos.filter(Boolean).length === 0 ? (
          <EstadoVacio
            compacto
            icono={<StarIcon />}
            titulo={t('portada.favoritosVacioTitulo')}
            descripcion={t('portada.favoritosVacioDescripcion')}
          />
        ) : (
          <ul className="hrl-lista">
            {entidades.datos.map(
              e =>
                e && (
                  <li key={`${e.kind}:${e.metadata.name}`}>
                    <Link className="hrl-lista__item" to={rutaEntidad(e)}>
                      <IconoTipo tipo={e.kind} />
                      <span className="hrl-lista__texto">
                        <Text variant="body-small" weight="bold">
                          {tituloDe(e)}
                        </Text>
                        <Text variant="body-x-small" color="secondary">
                          {e.kind}
                          {e.metadata.description
                            ? ` · ${e.metadata.description}`
                            : ''}
                        </Text>
                      </span>
                    </Link>
                  </li>
                ),
            )}
          </ul>
        ))}
      {entidades.estado === 'error' && (
        <Text variant="body-small" color="danger">
          {entidades.error.message}
        </Text>
      )}
    </Panel>
  );
};

// Backstage guarda como nombre de la visita el título de la pestaña
// («Portal de Desarrollo HRL | Techdocs | Portal de Desarrollo HRL») o el
// segmento de la ruta («home»): se quita el nombre del portal y se capitaliza.
const nombreVisita = (nombre: string, portal: string) => {
  const partes = nombre
    .split(' | ')
    .map(p => p.trim())
    .map(p => p.replace(` en ${portal}`, ''))
    .filter(p => p && p !== portal);
  const limpio = partes[partes.length - 1] ?? nombre;
  return limpio.charAt(0).toUpperCase() + limpio.slice(1);
};

const Recientes = () => {
  const { t } = useTranslationRef(textosHrl);
  const visitas = useApi(visitsApiRef);
  const lista = useCarga(
    () =>
      visitas.list({
        limit: 6,
        orderBy: [{ field: 'timestamp', direction: 'desc' }],
      }),
    [visitas],
  );
  const formato = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  const haceCuanto = (ms: number) => {
    const minutos = Math.round((ms - Date.now()) / 60000);
    if (Math.abs(minutos) < 60) return formato.format(minutos, 'minute');
    const horas = Math.round(minutos / 60);
    if (Math.abs(horas) < 24) return formato.format(horas, 'hour');
    return formato.format(Math.round(horas / 24), 'day');
  };

  return (
    <Panel titulo={t('portada.recientes')} icono={<HistoryIcon />}>
      {lista.estado === 'cargando' && <CargandoLista />}
      {lista.estado === 'listo' &&
        (lista.datos.length === 0 ? (
          <EstadoVacio
            compacto
            icono={<HistoryIcon />}
            titulo={t('portada.recientesVacioTitulo')}
            descripcion={t('portada.recientesVacioDescripcion')}
          />
        ) : (
          <ul className="hrl-lista">
            {lista.datos.map(v => (
              <li key={v.id}>
                <Link className="hrl-lista__item" to={v.pathname}>
                  <IconoTipo
                    tipo={v.entityRef ? partesRef(v.entityRef).kind : undefined}
                  />
                  <span className="hrl-lista__texto">
                    <Text variant="body-small" weight="bold">
                      {nombreVisita(v.name, t('portal.title'))}
                    </Text>
                    <Text variant="body-x-small" color="secondary">
                      {haceCuanto(v.timestamp)}
                    </Text>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ))}
      {lista.estado === 'error' && (
        <Text variant="body-small" color="danger">
          {lista.error.message}
        </Text>
      )}
    </Panel>
  );
};

export const Portada = () => {
  const { t } = useTranslationRef(textosHrl);
  // Una sola consulta al catálogo para las cifras y los proyectos.
  const resumen = useResumenCatalogo();
  return (
    <div className="hrl-portada">
      <Heroe />
      <div className="hrl-portada__cuerpo">
        <Cifras resumen={resumen} />

        <div className="hrl-portada__trabajo">
          <Pendiente />
          <div className="hrl-seccion">
            <Accesos />
            <ListaPrimerosPasos />
          </div>
        </div>

        <section className="hrl-seccion">
          <div className="hrl-seccion__cabecera">
            <Text as="h2" variant="title-small" weight="bold">
              {t('paginas.proyectos')}
            </Text>
            <Link to="/proyectos" className="hrl-enlace-flecha">
              {t('portada.verTodos')} <ArrowIcon aria-hidden />
            </Link>
          </div>
          <RejillaProyectos resumen={resumen} limite={6} />
        </section>

        <div className="hrl-portada__columnas">
          <Favoritos />
          <Recientes />
        </div>

        <p className="hrl-aviso">
          <ShieldIcon aria-hidden />
          {t('portada.avisoPacientes')}
        </p>
      </div>
    </div>
  );
};
