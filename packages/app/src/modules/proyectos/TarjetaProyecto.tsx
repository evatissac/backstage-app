import { Link } from 'react-router-dom';
import { Text } from '@backstage/ui';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { textosHrl } from '../idioma';
import {
  colorProyecto,
  iniciales,
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

/**
 * Tarjeta de proyecto: solo su nombre y su objetivo. El resto (piezas,
 * tecnologías, avance) se ve al entrar, en el recorrido del proyecto.
 */
export const TarjetaProyecto = ({ proyecto }: { proyecto: Proyecto }) => {
  const { t } = useTranslationRef(textosHrl);
  const { sistema } = proyecto;
  return (
    <Link
      to={rutaProyecto(sistema)}
      className="hrl-proyecto"
      style={{ ['--hrl-proyecto' as string]: colorProyecto(sistema) }}
    >
      <span className="hrl-identidad hrl-proyecto__cabecera">
        <Text
          as="h3"
          variant="title-medium"
          weight="bold"
          className="hrl-identidad__titulo"
        >
          {tituloDe(sistema)}
        </Text>
      </span>
      <span className="hrl-proyecto__cuerpo">
        <Text
          as="p"
          variant="body-medium"
          color="secondary"
          className="hrl-proyecto__desc"
        >
          {sistema.metadata.description ?? t('proyectos.sinDescripcion')}
        </Text>
      </span>
    </Link>
  );
};
