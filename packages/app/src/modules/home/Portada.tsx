import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SearchField, Skeleton, Text } from '@backstage/ui';
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
import ApiIcon from '@material-ui/icons/SettingsEthernetOutlined';
import StarIcon from '@material-ui/icons/StarBorderOutlined';
import HistoryIcon from '@material-ui/icons/HistoryOutlined';
import ShieldIcon from '@material-ui/icons/VerifiedUserOutlined';
import ArrowIcon from '@material-ui/icons/ArrowForward';
import { textosHrl } from '../idioma';
import { Carga, useCarga } from '../comun/useCarga';
import { EstadoVacio } from '../comun/EstadoVacio';
import { IconoTipo } from '../comun/iconos';
import { partesRef, rutaEntidad, tituloDe } from '../comun/entidades';
import { RejillaProyectos } from '../proyectos';
import { ListaPrimerosPasos } from '../guia';
import { ResumenCalidad, useCalidad } from '../calidad';
import { ResumenCatalogo, useResumenCatalogo } from '../proyectos/datos';
import '../comun/comun.css';
import './portada.css';

const saludo = (hora: number) => {
  if (hora < 12) return 'portada.saludoManana' as const;
  if (hora < 19) return 'portada.saludoTarde' as const;
  return 'portada.saludoNoche' as const;
};

const Heroe = ({ resumen }: { resumen: Carga<ResumenCatalogo> }) => {
  const { t } = useTranslationRef(textosHrl);
  const navigate = useNavigate();
  const identityApi = useApi(identityApiRef);
  const perfil = useCarga(() => identityApi.getProfileInfo(), [identityApi]);
  const nombre =
    perfil.estado === 'listo'
      ? (perfil.datos.displayName ?? '').split(' ')[0]
      : '';

  const cifras =
    resumen.estado === 'listo'
      ? [
          {
            valor: resumen.datos.proyectos.length,
            texto: t('portada.cifraProyectos'),
          },
          {
            valor: resumen.datos.componentes,
            texto: t('portada.cifraComponentes'),
          },
          { valor: resumen.datos.apis, texto: t('portada.cifraApis') },
          { valor: resumen.datos.personas, texto: t('portada.cifraPersonas') },
        ]
      : undefined;

  return (
    <section className="hrl-heroe">
      <div className="hrl-heroe__contenido">
        <p className="hrl-heroe__antetitulo">{t('portal.title')}</p>
        <h1 className="hrl-heroe__titulo">
          {nombre
            ? t(saludo(new Date().getHours()), { nombre })
            : t('portada.saludoSinNombre')}
        </h1>
        <p className="hrl-heroe__sub">{t('portada.subtitulo')}</p>
        <div className="hrl-heroe__busqueda">
          <SearchField
            aria-label={t('portada.buscarEtiqueta')}
            placeholder={t('portada.buscarPlaceholder')}
            onSubmit={valor =>
              navigate(`/search?query=${encodeURIComponent(valor)}`)
            }
          />
        </div>
        <p className="hrl-heroe__pista">{t('portada.buscarPista')}</p>
      </div>
      <dl className="hrl-heroe__cifras" aria-busy={!cifras}>
        {(
          cifras ??
          [1, 2, 3, 4].map(i => ({ valor: undefined, texto: String(i) }))
        ).map(c => (
          <div key={c.texto} className="hrl-heroe__cifra">
            <dd>{c.valor ?? '·'}</dd>
            <dt>{cifras ? c.texto : ' '}</dt>
          </div>
        ))}
      </dl>
    </section>
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
        href="/api-docs"
        icono={<ApiIcon />}
        titulo={t('paginas.api-docs')}
        texto={t('portada.accesoApis')}
      />
    </div>
  );
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

/** Cobertura del catálogo: lo que mide la página de calidad, resumido. */
const SaludCatalogo = () => {
  const { t } = useTranslationRef(textosHrl);
  const calidad = useCalidad();
  if (calidad.estado !== 'listo' || calidad.datos.length === 0) return null;
  return (
    <section className="hrl-seccion">
      <div className="hrl-seccion__cabecera">
        <Text as="h2" variant="title-small" weight="bold">
          {t('portada.salud')}
        </Text>
        <Link to="/calidad" className="hrl-enlace-flecha">
          {t('portada.verDetalle')} <ArrowIcon aria-hidden />
        </Link>
      </div>
      <ResumenCalidad datos={calidad.datos} />
    </section>
  );
};

export const Portada = () => {
  const { t } = useTranslationRef(textosHrl);
  // Una sola consulta al catálogo para las cifras del héroe y los proyectos.
  const resumen = useResumenCatalogo();
  return (
    <div className="hrl-portada">
      <Heroe resumen={resumen} />
      <div className="hrl-portada__cuerpo">
        <Accesos />

        <ListaPrimerosPasos />

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

        <SaludCatalogo />

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
