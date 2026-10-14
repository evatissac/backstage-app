import { Link } from 'react-router-dom';
import { Text } from '@backstage/ui';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import ArrowIcon from '@material-ui/icons/ArrowForward';
import { textosHrl } from '../idioma';
import {
  colorProyecto,
  iniciales,
  partesRef,
  relaciones,
  rutaProyecto,
  tituloDe,
} from '../comun/entidades';
import { Proyecto } from './datos';
import '../comun/comun.css';
import './proyectos.css';

export const Monograma = (props: {
  texto: string;
  color: string;
  grande?: boolean;
}) => (
  <span
    className={`hrl-monograma${props.grande ? ' hrl-monograma--grande' : ''}`}
    style={{ background: props.color }}
    aria-hidden
  >
    {iniciales(props.texto)}
  </span>
);

/** Cuántas tecnologías se ven en la tarjeta; el resto se resume en «+N». */
const MAX_TECNOLOGIAS = 6;

/**
 * Tarjeta de proyecto con la identidad de los «golden paths» de Spotify:
 * cabecera de color con formas geométricas, equipo responsable arriba y el
 * título en blanco; debajo, la descripción, el stack y las cifras.
 */
export const TarjetaProyecto = ({ proyecto }: { proyecto: Proyecto }) => {
  const { t } = useTranslationRef(textosHrl);
  const { sistema } = proyecto;
  const titulo = tituloDe(sistema);
  const responsable = relaciones(sistema, 'ownedBy')[0];
  const visibles = proyecto.tecnologias.slice(0, MAX_TECNOLOGIAS);
  const ocultas = proyecto.tecnologias.length - visibles.length;

  return (
    <Link
      to={rutaProyecto(sistema)}
      className="hrl-proyecto"
      style={{ ['--hrl-proyecto' as string]: colorProyecto(sistema) }}
    >
      <span className="hrl-identidad hrl-proyecto__cabecera">
        <span className="hrl-identidad__equipo">
          {responsable
            ? partesRef(responsable).name
            : t('proyecto.sinResponsable')}
        </span>
        <Text
          as="h3"
          variant="title-small"
          weight="bold"
          className="hrl-identidad__titulo"
        >
          {titulo}
        </Text>
      </span>

      <span className="hrl-proyecto__cuerpo">
        <Text
          as="p"
          variant="body-small"
          color="secondary"
          className="hrl-proyecto__desc"
        >
          {sistema.metadata.description ?? t('proyectos.sinDescripcion')}
        </Text>

        {visibles.length > 0 && (
          <span className="hrl-stack" aria-label={t('proyectos.stack')}>
            {visibles.map(tec => (
              <span key={tec} className="hrl-stack__item">
                {tec}
              </span>
            ))}
            {ocultas > 0 && <span className="hrl-stack__item">+{ocultas}</span>}
          </span>
        )}

        <span className="hrl-proyecto__pie">
          <span className="hrl-proyecto__datos">
            <span>
              <strong>{proyecto.componentes}</strong>{' '}
              {t('proyectos.componentes')}
            </span>
            <span>
              <strong>{proyecto.apis}</strong> {t('proyectos.apis')}
            </span>
            <span>
              <strong>{proyecto.documentos}</strong> {t('proyectos.documentos')}
            </span>
          </span>
          <span className="hrl-proyecto__accion">
            {t('proyectos.abrir')}
            <ArrowIcon aria-hidden />
          </span>
        </span>
      </span>
    </Link>
  );
};
