import { Link } from 'react-router-dom';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { textosHrl } from '../idioma';

/**
 * Nombre del portal en la barra. El cuadro con «HRL» ocupa el lugar del logo
 * mientras no esté: cuando llegue, va dentro de `.hrl-marca__sello`.
 */
export const Marca = (props: { plegada?: boolean }) => {
  const { t } = useTranslationRef(textosHrl);
  return (
    <Link to="/" className="hrl-marca" aria-label={t('portal.title')}>
      <span className="hrl-marca__sello" aria-hidden>
        HRL
      </span>
      {!props.plegada && (
        <span className="hrl-marca__nombre" aria-hidden>
          <span className="hrl-marca__linea1">{t('portal.titleLine1')}</span>
          <span className="hrl-marca__linea2">{t('portal.titleLine2')}</span>
        </span>
      )}
    </Link>
  );
};
