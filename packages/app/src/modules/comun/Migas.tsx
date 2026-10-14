import { Link } from 'react-router-dom';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { textosHrl } from '../idioma';
import './comun.css';

export type Miga = { texto: string; href?: string };

/**
 * Migas de pan: dónde está la página dentro del portal. La última es la
 * página actual y no es enlace.
 */
export const Migas = (props: { migas: Miga[]; claro?: boolean }) => {
  const { t } = useTranslationRef(textosHrl);
  return (
    <nav
      aria-label={t('migas.etiqueta')}
      className={`hrl-migas${props.claro ? ' hrl-migas--claro' : ''}`}
    >
      <ol>
        {props.migas.map((m, i) => {
          const ultima = i === props.migas.length - 1;
          return (
            <li key={`${m.texto}-${i}`}>
              {m.href && !ultima ? (
                <Link to={m.href}>{m.texto}</Link>
              ) : (
                <span aria-current={ultima ? 'page' : undefined}>
                  {m.texto}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
