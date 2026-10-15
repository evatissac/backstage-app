import { Link } from 'react-router-dom';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { textosHrl } from '../idioma';
import logo from './logo-hrl.png';

/** Logo oficial del HRL. Lo comparten la barra lateral y la página de ingreso. */
export const LogoHrl = (props: { className?: string }) => (
  <img src={logo} alt="" className={props.className} />
);

/** Logo del hospital y, al lado, el nombre del portal. */
export const Marca = (props: { plegada?: boolean }) => {
  const { t } = useTranslationRef(textosHrl);
  return (
    <Link to="/" className="hrl-marca" aria-label={t('portal.title')}>
      <LogoHrl className="hrl-marca__logo" />
      {!props.plegada && (
        <span className="hrl-marca__nombre" aria-hidden>
          {t('portal.title')}
        </span>
      )}
    </Link>
  );
};
