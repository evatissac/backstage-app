import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Text } from '@backstage/ui';
import { useApi, useTranslationRef } from '@backstage/frontend-plugin-api';
import { useStarredEntities } from '@backstage/plugin-catalog-react';
import { visitsApiRef } from '@backstage/plugin-home';
import CheckIcon from '@material-ui/icons/CheckCircle';
import PendienteIcon from '@material-ui/icons/RadioButtonUnchecked';
import CerrarIcon from '@material-ui/icons/Close';
import BanderaIcon from '@material-ui/icons/FlagOutlined';
import { textosHrl } from '../idioma';
import { useCarga } from '../comun/useCarga';
import './guia.css';

const CLAVE_OCULTA = 'hrl:primeros-pasos-oculta';

const leerOculta = () => {
  try {
    return window.localStorage.getItem(CLAVE_OCULTA) === 'true';
  } catch {
    return false;
  }
};

type Paso = {
  id: 'proyecto' | 'documentacion' | 'favorito' | 'calidad' | 'plantilla';
  href: string;
  hecho: boolean;
};

/**
 * «Primeros pasos» en la portada. Cada paso se marca solo, a partir de las
 * visitas registradas y de los favoritos: nadie tiene que tildarlos a mano.
 */
export const ListaPrimerosPasos = () => {
  const { t } = useTranslationRef(textosHrl);
  const visitas = useApi(visitsApiRef);
  const { starredEntities } = useStarredEntities();
  const [oculta, setOculta] = useState(leerOculta);
  const historial = useCarga(() => visitas.list({ limit: 200 }), [visitas]);

  if (oculta || historial.estado !== 'listo') return null;

  const visito = (prefijo: RegExp) =>
    historial.datos.some(v => prefijo.test(v.pathname));
  const pasos: Paso[] = [
    {
      id: 'proyecto',
      href: '/proyectos',
      hecho: visito(/^\/proyectos\/[^/]+/),
    },
    { id: 'documentacion', href: '/docs', hecho: visito(/^\/docs\/[^/]+/) },
    { id: 'favorito', href: '/catalog', hecho: starredEntities.size > 0 },
    {
      id: 'calidad',
      href: '/calidad',
      hecho: visito(/^\/calidad|\/calidad$/),
    },
    {
      id: 'plantilla',
      href: '/autoservicio',
      hecho: visito(/^\/create\/tasks\//),
    },
  ];
  const hechos = pasos.filter(p => p.hecho).length;

  const ocultar = () => {
    try {
      window.localStorage.setItem(CLAVE_OCULTA, 'true');
    } catch {
      // Sin almacenamiento: se oculta solo en esta visita.
    }
    setOculta(true);
  };

  return (
    <section
      className="hrl-tarjeta hrl-pasos"
      aria-labelledby="hrl-pasos-titulo"
    >
      <div className="hrl-pasos__cabecera">
        <span className="hrl-pasos__icono" aria-hidden>
          <BanderaIcon />
        </span>
        <div className="hrl-pasos__titulos">
          <Text
            as="h2"
            id="hrl-pasos-titulo"
            variant="title-x-small"
            weight="bold"
          >
            {t('guia.listaTitulo')}
          </Text>
          <Text as="p" variant="body-small" color="secondary">
            {t('guia.listaProgreso', {
              hechos: String(hechos),
              total: String(pasos.length),
            })}{' '}
            · <Link to="/primeros-pasos">{t('guia.verGuia')}</Link>
          </Text>
        </div>
        <button
          type="button"
          className="hrl-pasos__cerrar"
          onClick={ocultar}
          aria-label={t('guia.ocultar')}
          title={t('guia.ocultar')}
        >
          <CerrarIcon />
        </button>
      </div>
      <div
        className="hrl-pasos__barra"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={pasos.length}
        aria-valuenow={hechos}
        aria-label={t('guia.listaTitulo')}
      >
        <span style={{ width: `${(hechos / pasos.length) * 100}%` }} />
      </div>
      <ol className="hrl-pasos__lista">
        {pasos.map(p => (
          <li key={p.id} data-hecho={p.hecho}>
            <Link to={p.href} className="hrl-pasos__paso">
              {p.hecho ? (
                <CheckIcon className="hrl-pasos__estado" aria-hidden />
              ) : (
                <PendienteIcon className="hrl-pasos__estado" aria-hidden />
              )}
              <span>
                <span className="hrl-pasos__texto">
                  {t(`guia.pasos.${p.id}` as const)}
                </span>
                <span className="hrl-sr">
                  {p.hecho ? t('calidad.cumple') : t('calidad.noCumple')}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
};
