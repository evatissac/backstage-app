import { useState } from 'react';
import {
  Alert,
  ButtonIcon,
  ButtonLink,
  Menu,
  MenuItem,
  MenuTrigger,
  SearchField,
  Skeleton,
  Text,
} from '@backstage/ui';
import {
  alertApiRef,
  useApi,
  useTranslationRef,
} from '@backstage/frontend-plugin-api';
import CrearIcon from '@material-ui/icons/AddCircleOutline';
import DocumentarIcon from '@material-ui/icons/MenuBookOutlined';
import AccionIcon from '@material-ui/icons/FlashOnOutlined';
import HistorialIcon from '@material-ui/icons/HistoryOutlined';
import MasIcon from '@material-ui/icons/MoreHoriz';
import EnlaceIcon from '@material-ui/icons/LaunchOutlined';
import BuscarIcon from '@material-ui/icons/SearchOutlined';
import { textosHrl } from '../idioma';
import { EstadoVacio } from '../comun/EstadoVacio';
import { EsqueletoTarjetas } from '../comun/Esqueletos';
import { Etiqueta } from '../comun/Etiqueta';
import { rutaEntidad, tituloDe } from '../comun/entidades';
import {
  ANOTACION_VERBO,
  Plantilla,
  rutaPlantilla,
  tipoPlantilla,
  usePlantillas,
} from './datos';
import '../comun/comun.css';
import './autoservicio.css';

const IconoCategoria = ({ tipo }: { tipo: string }) => {
  switch (tipo) {
    case 'proyecto':
      return <CrearIcon />;
    case 'documentacion':
      return <DocumentarIcon />;
    default:
      return <AccionIcon />;
  }
};

const TarjetaAccion = ({ p }: { p: Plantilla }) => {
  const { t } = useTranslationRef(textosHrl);
  const alertas = useApi(alertApiRef);
  const titulo = tituloDe(p);
  const verbo =
    p.metadata.annotations?.[ANOTACION_VERBO] ?? t('autoservicio.empezar');
  const docs = p.metadata.links?.[0];

  const copiarEnlace = async () => {
    try {
      await window.navigator.clipboard.writeText(
        `${window.location.origin}${rutaPlantilla(p)}`,
      );
      alertas.post({
        message: t('autoservicio.enlaceCopiado'),
        severity: 'success',
        display: 'transient',
      });
    } catch {
      alertas.post({
        message: t('entidad.enlaceNoCopiado'),
        severity: 'error',
      });
    }
  };

  return (
    <article className="hrl-tarjeta hrl-accion" aria-label={titulo}>
      <header className="hrl-accion__cabecera">
        <span className="hrl-accion__icono" aria-hidden>
          <IconoCategoria tipo={tipoPlantilla(p)} />
        </span>
        <Text as="h3" variant="title-x-small" weight="bold">
          {titulo}
        </Text>
        <MenuTrigger>
          <ButtonIcon
            variant="tertiary"
            size="small"
            className="hrl-accion__menu"
            aria-label={t('autoservicio.masOpciones', { accion: titulo })}
            icon={<MasIcon />}
          />
          <Menu placement="bottom end">
            <MenuItem onAction={copiarEnlace}>
              {t('autoservicio.copiarEnlace')}
            </MenuItem>
            <MenuItem href={rutaEntidad(p)}>
              {t('autoservicio.verEnCatalogo')}
            </MenuItem>
          </Menu>
        </MenuTrigger>
      </header>
      <Text as="p" variant="body-small" color="secondary">
        {p.metadata.description ?? t('proyectos.sinDescripcion')}
      </Text>
      {(p.metadata.tags ?? []).length > 0 && (
        <span className="hrl-accion__etiquetas">
          {(p.metadata.tags ?? []).map(e => (
            <Etiqueta key={e} texto={e} />
          ))}
        </span>
      )}
      <footer className="hrl-accion__pie">
        {docs ? (
          <a
            className="hrl-accion__docs"
            href={docs.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <EnlaceIcon aria-hidden />
            {docs.title ?? t('autoservicio.documentacion')}
          </a>
        ) : (
          <span />
        )}
        <ButtonLink
          href={rutaPlantilla(p)}
          variant="primary"
          size="medium"
          iconStart={<AccionIcon />}
          aria-label={`${verbo}: ${titulo}`}
        >
          {verbo}
        </ButtonLink>
      </footer>
    </article>
  );
};

/**
 * `/autoservicio`: lo que cualquiera puede hacer sin pedírselo a alguien,
 * agrupado por categoría (el `spec.type` de cada plantilla).
 */
export const PaginaAutoservicio = () => {
  const { t } = useTranslationRef(textosHrl);
  const carga = usePlantillas();
  const [busqueda, setBusqueda] = useState('');

  const categoria = (tipo: string) => {
    switch (tipo) {
      case 'proyecto':
        return t('autoservicio.categoria.proyecto');
      case 'documentacion':
        return t('autoservicio.categoria.documentacion');
      default:
        return tipo;
    }
  };

  let contenido;
  if (carga.estado === 'cargando') {
    contenido = (
      <div className="hrl-seccion">
        <Skeleton width={180} height={22} />
        <EsqueletoTarjetas rejilla="hrl-acciones" cantidad={4} lineas={3} />
      </div>
    );
  } else if (carga.estado === 'error') {
    contenido = (
      <Alert
        status="danger"
        icon
        title={t('autoservicio.errorCarga')}
        description={carga.error.message}
      />
    );
  } else if (carga.datos.length === 0) {
    contenido = (
      <EstadoVacio
        icono={<AccionIcon />}
        titulo={t('autoservicio.vacioTitulo')}
        descripcion={t('autoservicio.vacioDescripcion')}
      />
    );
  } else {
    const texto = busqueda.trim().toLowerCase();
    const visibles = carga.datos.filter(
      p =>
        !texto ||
        [tituloDe(p), p.metadata.description ?? '', ...(p.metadata.tags ?? [])]
          .join(' ')
          .toLowerCase()
          .includes(texto),
    );
    const grupos = new Map<string, Plantilla[]>();
    for (const p of visibles) {
      const tipo = tipoPlantilla(p);
      grupos.set(tipo, [...(grupos.get(tipo) ?? []), p]);
    }
    contenido =
      visibles.length === 0 ? (
        <EstadoVacio
          icono={<BuscarIcon />}
          titulo={t('autoservicio.sinResultadosTitulo')}
          descripcion={t('autoservicio.sinResultadosDescripcion')}
        />
      ) : (
        [...grupos].map(([tipo, plantillas]) => (
          <section
            key={tipo}
            className="hrl-seccion"
            aria-labelledby={`hrl-categoria-${tipo}`}
          >
            <Text
              as="h2"
              id={`hrl-categoria-${tipo}`}
              variant="title-small"
              weight="bold"
            >
              {categoria(tipo)}
            </Text>
            <div className="hrl-acciones">
              {plantillas.map(p => (
                <TarjetaAccion key={p.metadata.name} p={p} />
              ))}
            </div>
          </section>
        ))
      );
  }

  return (
    <div className="hrl-pagina">
      <div className="hrl-autoservicio__cabecera">
        <div className="hrl-intro">
          <Text as="h1" variant="title-medium" weight="bold">
            {t('autoservicio.titulo')}
          </Text>
          <Text as="p" variant="body-medium" color="secondary">
            {t('autoservicio.intro')}
          </Text>
        </div>
        <ButtonLink
          href="/create/tasks"
          variant="secondary"
          iconStart={<HistorialIcon />}
        >
          {t('autoservicio.historial')}
        </ButtonLink>
      </div>
      <SearchField
        aria-label={t('autoservicio.buscar')}
        placeholder={t('autoservicio.buscar')}
        value={busqueda}
        onChange={setBusqueda}
        className="hrl-autoservicio__buscar"
      />
      {contenido}
    </div>
  );
};
