import { Link, useNavigate } from 'react-router-dom';
import { Alert, SearchField, Skeleton, Text } from '@backstage/ui';
import {
  identityApiRef,
  useApi,
  useTranslationRef,
} from '@backstage/frontend-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { visitsApiRef } from '@backstage/plugin-home';
import HistoryIcon from '@material-ui/icons/HistoryOutlined';
import DocIcon from '@material-ui/icons/MenuBookOutlined';
import ProyectoIcon from '@material-ui/icons/FolderSpecialOutlined';
import PaginaIcon from '@material-ui/icons/WebOutlined';
import { textosHrl } from '../idioma';
import { useCarga } from '../comun/useCarga';
import { EstadoVacio } from '../comun/EstadoVacio';
import { IconoTipo } from '../comun/iconos';
import { partesRef, tituloDe } from '../comun/entidades';
import '../comun/comun.css';
import './portada.css';

const saludo = (hora: number) => {
  if (hora < 12) return 'portada.saludoManana' as const;
  if (hora < 19) return 'portada.saludoTarde' as const;
  return 'portada.saludoNoche' as const;
};

/** Héroe compacto: saludo y búsqueda en una franja. */
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
    <section className="hrl-heroe hrl-heroe--compacto hrl-heroe--solo">
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

type Clase = 'entidad' | 'docs' | 'proyecto' | 'pagina';

/** Qué se visitó, a partir de la ruta: la visita solo guarda el título de la pestaña. */
const leerRuta = (
  pathname: string,
): { clase: Clase; ref?: string; pagina?: string } => {
  const catalogo = pathname.match(/^\/catalog\/([^/]+)\/([^/]+)\/([^/]+)/);
  if (catalogo) {
    return {
      clase: 'entidad',
      ref: `${catalogo[2]}:${catalogo[1]}/${catalogo[3]}`.toLowerCase(),
    };
  }
  const docs = pathname.match(/^\/docs\/([^/]+)\/([^/]+)\/([^/]+)/);
  if (docs) {
    return {
      clase: 'docs',
      ref: `${docs[2]}:${docs[1]}/${docs[3]}`.toLowerCase(),
    };
  }
  const proyecto = pathname.match(/^\/proyectos\/([^/]+)/);
  if (proyecto) {
    return {
      clase: 'proyecto',
      ref: `system:default/${proyecto[1]}`.toLowerCase(),
    };
  }
  return { clase: 'pagina', pagina: pathname.split('/')[1] ?? '' };
};

// Primer segmento de la ruta → clave del título de esa página.
const PAGINAS: Record<string, string> = {
  proyectos: 'paginas.proyectos',
  catalog: 'paginas.catalog',
  docs: 'paginas.techdocs',
  'api-docs': 'paginas.api-docs',
  calidad: 'paginas.calidad',
  autoservicio: 'paginas.autoservicio',
  mapa: 'paginas.mapa',
  create: 'paginas.scaffolder',
  settings: 'paginas.user-settings',
  notifications: 'paginas.notifications',
  'primeros-pasos': 'paginas.guia',
};

type ClavePagina = 'paginas.catalog';

/** Hoy, ayer, esta semana o antes: para agrupar la lista. */
const tramo = (ms: number) => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  if (ms >= hoy.getTime()) return 'hoy' as const;
  if (ms >= hoy.getTime() - 86400000) return 'ayer' as const;
  if (ms >= hoy.getTime() - 7 * 86400000) return 'semana' as const;
  return 'antes' as const;
};

/** Lo último que viste en el portal, sin repetir y agrupado por día. */
const UltimoVisto = () => {
  const { t } = useTranslationRef(textosHrl);
  const visitas = useApi(visitsApiRef);
  const catalogo = useApi(catalogApiRef);
  const lista = useCarga(async () => {
    const todas = await visitas.list({
      limit: 60,
      orderBy: [{ field: 'timestamp', direction: 'desc' }],
    });
    // Una entrada por cosa visitada (la visita más reciente): las pestañas
    // de un mismo proyecto o ficha cuentan como una sola. Sin la portada.
    const vistas = new Set<string>();
    const items = todas
      .filter(v => (v.pathname.replace(/\/$/, '') || '/') !== '/')
      .map(v => ({ v, ...leerRuta(v.pathname) }))
      .filter(i => {
        const clave = `${i.clase}:${i.ref ?? i.pagina}`;
        if (vistas.has(clave)) return false;
        vistas.add(clave);
        return true;
      })
      .slice(0, 20);
    const refs = [
      ...new Set(items.map(i => i.ref).filter((r): r is string => !!r)),
    ];
    const entidades = refs.length
      ? (await catalogo.getEntitiesByRefs({ entityRefs: refs })).items
      : [];
    const titulos = new Map(
      refs.map((r, i) => {
        const e = entidades[i];
        return [r, e ? tituloDe(e) : undefined] as const;
      }),
    );
    return items.map(i => ({
      ...i,
      titulo: i.ref ? titulos.get(i.ref) : undefined,
    }));
  }, [visitas, catalogo]);

  const formato = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  const haceCuanto = (ms: number) => {
    const minutos = Math.round((ms - Date.now()) / 60000);
    if (Math.abs(minutos) < 60) return formato.format(minutos, 'minute');
    const horas = Math.round(minutos / 60);
    if (Math.abs(horas) < 24) return formato.format(horas, 'hour');
    return formato.format(Math.round(horas / 24), 'day');
  };

  if (lista.estado === 'cargando') {
    return <Skeleton width="100%" height={320} />;
  }
  if (lista.estado === 'error') {
    return (
      <Alert
        status="danger"
        icon
        title={t('portada.recientesError')}
        description={lista.error.message}
      />
    );
  }
  if (lista.datos.length === 0) {
    return (
      <EstadoVacio
        icono={<HistoryIcon />}
        titulo={t('portada.recientesVacioTitulo')}
        descripcion={t('portada.recientesVacioDescripcion')}
      />
    );
  }

  type Item = (typeof lista.datos)[number];
  const nombre = (i: Item) => {
    if (i.titulo) return i.titulo;
    if (i.ref) return partesRef(i.ref).name;
    const clave = PAGINAS[i.pagina ?? ''];
    return clave ? t(clave as ClavePagina) : i.v.pathname;
  };
  const detalle = (i: Item) => {
    if (i.clase === 'docs') return t('portada.claseDocs');
    if (i.clase === 'proyecto') return t('portada.claseProyecto');
    if (i.clase === 'entidad') {
      const kind = partesRef(i.ref!).kind;
      return ['component', 'api', 'resource'].includes(kind)
        ? t(`proyecto.clase.${kind}` as 'proyecto.clase.api')
        : kind.charAt(0).toUpperCase() + kind.slice(1);
    }
    return t('portada.clasePagina');
  };
  const icono = (i: Item) => {
    if (i.clase === 'docs') return <DocIcon />;
    if (i.clase === 'proyecto') return <ProyectoIcon />;
    if (i.clase === 'entidad') {
      return <IconoTipo tipo={partesRef(i.ref!).kind} />;
    }
    return <PaginaIcon />;
  };

  const grupos = new Map<string, Item[]>();
  for (const i of lista.datos) {
    const clave = tramo(i.v.timestamp);
    grupos.set(clave, [...(grupos.get(clave) ?? []), i]);
  }

  return (
    <div className="hrl-ultimo">
      {[...grupos].map(([clave, items]) => (
        <section key={clave} aria-labelledby={`hrl-ultimo-${clave}`}>
          <h3 id={`hrl-ultimo-${clave}`} className="hrl-ultimo__tramo">
            {t(`portada.tramo.${clave}` as 'portada.tramo.hoy')}
          </h3>
          <ul className="hrl-ultimo__lista">
            {items.map(i => (
              <li key={i.v.id}>
                <Link to={i.v.pathname} className="hrl-ultimo__item">
                  <span className="hrl-ultimo__icono" aria-hidden>
                    {icono(i)}
                  </span>
                  <span className="hrl-ultimo__texto">
                    <Text variant="body-medium" weight="bold">
                      {nombre(i)}
                    </Text>
                    <Text variant="body-x-small" color="secondary">
                      {detalle(i)}
                    </Text>
                  </span>
                  <span className="hrl-ultimo__cuando">
                    {haceCuanto(i.v.timestamp)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
};

/** Inicio: solo lo último que viste en el portal. */
export const Portada = () => {
  const { t } = useTranslationRef(textosHrl);
  return (
    <div className="hrl-portada">
      <Heroe />
      <div className="hrl-portada__cuerpo">
        <Text as="h2" variant="title-small" weight="bold">
          {t('portada.recientes')}
        </Text>
        <UltimoVisto />
      </div>
    </div>
  );
};
