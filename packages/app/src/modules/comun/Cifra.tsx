import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ButtonIcon, Skeleton, Tooltip, TooltipTrigger } from '@backstage/ui';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import AyudaIcon from '@material-ui/icons/InfoOutlined';
import { textosHrl } from '../idioma';
import './comun.css';

/**
 * Una cifra grande con una línea que dice qué cuenta, como las tarjetas de
 * Port. `valor` en `null` es «sin datos», que no es lo mismo que cero.
 */
export const Cifra = (props: {
  valor: number | string | null | undefined;
  etiqueta: string;
  /** Qué se cuenta exactamente y de dónde sale. */
  ayuda: string;
  icono?: ReactNode;
  href?: string;
  cargando?: boolean;
}) => {
  const { t } = useTranslationRef(textosHrl);
  const sinDatos = props.valor === null || props.valor === undefined;
  const contenido = (
    <>
      <span className="hrl-cifra2__cabecera">
        {props.icono && (
          <span className="hrl-cifra2__icono" aria-hidden>
            {props.icono}
          </span>
        )}
        <span className="hrl-cifra2__etiqueta">{props.etiqueta}</span>
      </span>
      {props.cargando ? (
        <Skeleton width={56} height={32} />
      ) : (
        <span className="hrl-cifra2__valor" data-sin-datos={sinDatos}>
          {sinDatos ? t('cifra.sinDatos') : props.valor}
        </span>
      )}
    </>
  );
  return (
    <div className="hrl-cifra2">
      {props.href ? (
        <Link to={props.href} className="hrl-cifra2__enlace">
          {contenido}
        </Link>
      ) : (
        <div className="hrl-cifra2__enlace">{contenido}</div>
      )}
      <TooltipTrigger delay={300}>
        <ButtonIcon
          variant="tertiary"
          size="small"
          className="hrl-cifra2__ayuda"
          aria-label={t('cifra.queEs', { cifra: props.etiqueta })}
          icon={<AyudaIcon />}
        />
        <Tooltip>{props.ayuda}</Tooltip>
      </TooltipTrigger>
    </div>
  );
};
