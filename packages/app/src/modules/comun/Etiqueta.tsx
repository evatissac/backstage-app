import { ReactNode } from 'react';
import CicloIcon from '@material-ui/icons/LoopOutlined';
import ProduccionIcon from '@material-ui/icons/CheckCircleOutline';
import ExperimentalIcon from '@material-ui/icons/BuildOutlined';
import RetiradoIcon from '@material-ui/icons/ArchiveOutlined';
import './comun.css';

export type Tono = 'neutro' | 'acento' | 'ok' | 'aviso' | 'peligro' | 'info';

/**
 * Chip para un valor enumerado (tipo, ciclo de vida, entorno). Siempre lleva
 * texto y, si hay, icono: el color nunca es la única señal.
 */
export const Etiqueta = (props: {
  texto: string;
  tono?: Tono;
  icono?: ReactNode;
}) => (
  <span className="hrl-etiqueta" data-tono={props.tono ?? 'neutro'}>
    {props.icono && (
      <span className="hrl-etiqueta__icono" aria-hidden>
        {props.icono}
      </span>
    )}
    {props.texto}
  </span>
);

/** Tono e icono del ciclo de vida de una entidad (`spec.lifecycle`). */
export const estiloCiclo = (
  ciclo?: string,
): { tono: Tono; icono: ReactNode } => {
  switch (ciclo) {
    case 'production':
      return { tono: 'ok', icono: <ProduccionIcon /> };
    case 'experimental':
      return { tono: 'aviso', icono: <ExperimentalIcon /> };
    case 'deprecated':
      return { tono: 'peligro', icono: <RetiradoIcon /> };
    default:
      return { tono: 'neutro', icono: <CicloIcon /> };
  }
};
