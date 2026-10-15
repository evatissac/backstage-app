import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ButtonIcon, Header, Menu, MenuItem, MenuTrigger } from '@backstage/ui';
import {
  alertApiRef,
  useApi,
  useTranslationRef,
} from '@backstage/frontend-plugin-api';
import {
  catalogApiRef,
  UnregisterEntityDialog,
  useAsyncEntity,
  useStarredEntity,
} from '@backstage/plugin-catalog-react';
import { type EntityHeaderLayoutProps } from '@backstage/plugin-catalog-react/alpha';
import StarIcon from '@material-ui/icons/Star';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import MasIcon from '@material-ui/icons/MoreVert';
import { textosHrl } from '../idioma';
import { useCarga } from '../comun/useCarga';
import {
  colorProyecto,
  Entidad,
  iniciales,
  relaciones,
  rutaEntidad,
  rutaProyecto,
  tituloDe,
} from '../comun/entidades';
import { Puntaje } from '../calidad';
import { useCalidadEntidad } from '../calidad/datos';
import { MenuAcciones } from '../autoservicio';
import './entidad.css';

// Sin proyecto: verde agua oscuro, para que el texto blanco se lea en ambos temas.
const ColorDefecto = '#0f6661';

/** El sistema (proyecto) al que pertenece la entidad, o ella misma si lo es. */
const useProyecto = (entidad: Entidad) => {
  const catalogo = useApi(catalogApiRef);
  const ref =
    entidad.kind.toLowerCase() === 'system'
      ? undefined
      : relaciones(entidad, 'partOf').find(r => r.startsWith('system:'));
  return useCarga(async () => {
    if (entidad.kind.toLowerCase() === 'system') return entidad;
    if (!ref) return undefined;
    return catalogo.getEntityByRef(ref);
  }, [catalogo, ref, entidad.metadata.name]);
};

const PuntajeCalidad = ({ entidad }: { entidad: Entidad }) => {
  const carga = useCalidadEntidad(entidad);
  if (carga.estado !== 'listo') return null;
  return (
    <Link to={`${rutaEntidad(entidad)}/calidad`} className="hrl-entidad__nivel">
      <Puntaje r={carga.datos} compacto />
    </Link>
  );
};

const Acciones = ({ entidad }: { entidad: Entidad }) => {
  const { t } = useTranslationRef(textosHrl);
  const { isStarredEntity, toggleStarredEntity } = useStarredEntity(entidad);
  const [, setParams] = useSearchParams();
  const navigate = useNavigate();
  const alertas = useApi(alertApiRef);
  const [darDeBaja, setDarDeBaja] = useState(false);

  const copiarEnlace = async () => {
    try {
      await window.navigator.clipboard.writeText(window.location.href);
      alertas.post({
        message: t('entidad.enlaceCopiado'),
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
    <>
      <MenuAcciones entidad={entidad} />
      <ButtonIcon
        variant="secondary"
        aria-label={
          isStarredEntity ? t('entidad.quitarFavorito') : t('entidad.favorito')
        }
        icon={isStarredEntity ? <StarIcon /> : <StarBorderIcon />}
        onPress={toggleStarredEntity}
      />
      <MenuTrigger>
        <ButtonIcon
          variant="secondary"
          aria-label={t('entidad.masAcciones')}
          icon={<MasIcon />}
        />
        <Menu placement="bottom end">
          <MenuItem
            onAction={() =>
              setParams(p => {
                const siguiente = new URLSearchParams(p);
                siguiente.set('inspect', 'overview');
                return siguiente;
              })
            }
          >
            {t('entidad.inspeccionar')}
          </MenuItem>
          <MenuItem onAction={copiarEnlace}>
            {t('entidad.copiarEnlace')}
          </MenuItem>
          <MenuItem color="danger" onAction={() => setDarDeBaja(true)}>
            {t('entidad.darDeBaja')}
          </MenuItem>
        </Menu>
      </MenuTrigger>
      <UnregisterEntityDialog
        open={darDeBaja}
        entity={entidad}
        onClose={() => setDarDeBaja(false)}
        onConfirm={() => {
          setDarDeBaja(false);
          navigate('/catalog');
        }}
      />
    </>
  );
};

const CabeceraConEntidad = (
  props: EntityHeaderLayoutProps & { entidad: Entidad },
) => {
  const { t } = useTranslationRef(textosHrl);
  const { entidad } = props;
  const proyecto = useProyecto(entidad);
  const sistema = proyecto.estado === 'listo' ? proyecto.datos : undefined;
  const color = sistema ? colorProyecto(sistema) : ColorDefecto;
  const spec = (entidad.spec ?? {}) as { type?: string; lifecycle?: string };
  const conCalidad = ['component', 'api'].includes(entidad.kind.toLowerCase());

  const metadata = [
    ...(spec.lifecycle
      ? [{ label: t('entidad.ciclo'), value: spec.lifecycle }]
      : []),
  ];

  return (
    <div
      className="hrl-entidad"
      style={{ ['--hrl-proyecto' as string]: color }}
    >
      <div className="hrl-identidad hrl-entidad__franja">
        {sistema ? (
          <Link to={rutaProyecto(sistema)} className="hrl-entidad__proyecto">
            <span className="hrl-entidad__monograma" aria-hidden>
              {iniciales(tituloDe(sistema))}
            </span>
            <span>
              <span className="hrl-entidad__etiqueta">
                {t('entidad.proyecto')}
              </span>
              <span className="hrl-entidad__nombre">{tituloDe(sistema)}</span>
            </span>
          </Link>
        ) : (
          <span className="hrl-entidad__sin-proyecto">
            {proyecto.estado === 'listo' ? t('entidad.sinProyecto') : ''}
          </span>
        )}
        {conCalidad && <PuntajeCalidad entidad={entidad} />}
      </div>
      <Header
        title={tituloDe(entidad)}
        description={entidad.metadata.description}
        tags={[
          { label: entidad.kind },
          ...(spec.type ? [{ label: spec.type }] : []),
        ]}
        metadata={metadata}
        tabs={props.tabs}
        activeTabId={props.activeTabId}
        customActions={<Acciones entidad={entidad} />}
      />
    </div>
  );
};

/**
 * Cabecera de la ficha de una entidad: franja con el proyecto y su color, el
 * nivel de calidad y, debajo, la cabecera de BUI con las pestañas.
 * Reemplaza la de Backstage, que no sabe de proyectos.
 */
export const CabeceraEntidad = (props: EntityHeaderLayoutProps) => {
  const { entity } = useAsyncEntity();
  if (!entity) return <Header title="…" />;
  return <CabeceraConEntidad entidad={entity} {...props} />;
};
