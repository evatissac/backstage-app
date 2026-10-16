import { useEffect, useMemo, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { Alert, ButtonLink, SearchField, Text } from '@backstage/ui';
import {
  EsqueletoCatalogoVisual,
  MarcoConCarga,
} from '../comun/Esqueletos';
import {
  appThemeApiRef,
  useApi,
  useTranslationRef,
} from '@backstage/frontend-plugin-api';
import AbrirIcon from '@material-ui/icons/OpenInNew';
import CodigoIcon from '@material-ui/icons/CodeOutlined';
import BuscarIcon from '@material-ui/icons/SearchOutlined';
import { textosHrl } from '../idioma';
import { EstadoVacio } from '../comun/EstadoVacio';
import { Historia, useCatalogoVisual } from './github';

// Mismo orden que `storyOrder` en .ladle/config.mjs del kit; lo que no esté
// aquí va al final, por orden alfabético.
const ORDEN = [
  'Fundamentos',
  'Composición',
  'Primitivos',
  'Capas flotantes',
  'Estados',
  'Datos',
  'Gráficos',
  'Layout',
  'Iconos',
];

const posicion = (grupo: string) => {
  const i = ORDEN.indexOf(grupo);
  return i === -1 ? ORDEN.length : i;
};

/** Tema activo del portal, para que la historia se vea igual que lo demás. */
const useTema = () => {
  const temas = useApi(appThemeApiRef);
  const oscuroSistema = () =>
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  const calcular = (id?: string) =>
    (id ?? (oscuroSistema() ? 'dark' : 'light')) === 'dark' ? 'dark' : 'light';
  const [tema, setTema] = useState(() => calcular(temas.getActiveThemeId()));
  useEffect(() => {
    const sub = temas.activeThemeId$().subscribe(id => setTema(calcular(id)));
    return () => sub.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- calcular no cambia.
  }, [temas]);
  return tema;
};

/** Grupos → componentes → historias, filtrados por la búsqueda. */
const agrupar = (historias: Historia[], filtro: string) => {
  const texto = filtro.trim().toLowerCase();
  const grupos = new Map<string, Map<string, Historia[]>>();
  for (const h of historias) {
    if (
      texto &&
      ![...h.niveles, h.nombre].join(' ').toLowerCase().includes(texto)
    ) {
      continue;
    }
    const [grupo = '', componente = ''] = h.niveles;
    const porComponente = grupos.get(grupo) ?? new Map<string, Historia[]>();
    porComponente.set(componente, [
      ...(porComponente.get(componente) ?? []),
      h,
    ]);
    grupos.set(grupo, porComponente);
  }
  return [...grupos].sort(
    ([a], [b]) => posicion(a) - posicion(b) || a.localeCompare(b),
  );
};

/**
 * Pestaña «Catálogo visual»: la navegación es del portal (en español, con
 * búsqueda) y cada historia se dibuja con Ladle dentro de un iframe, en su
 * modo de vista previa. El iframe aísla el React 19 y los estilos del kit.
 */
export const PestanaCatalogoVisual = (props: {
  sistema: string;
  base: string;
  repositorio?: string;
}) => {
  const { t } = useTranslationRef(textosHrl);
  const carga = useCatalogoVisual(props.sistema);
  const tema = useTema();
  const [filtro, setFiltro] = useState('');
  const idActual = useParams()['*'] ?? '';

  const historias = useMemo(
    () => (carga.estado === 'listo' ? carga.datos.historias : []),
    [carga],
  );
  const grupos = useMemo(() => agrupar(historias, filtro), [historias, filtro]);

  if (carga.estado === 'cargando') {
    return <EsqueletoCatalogoVisual />;
  }
  if (carga.estado === 'error') {
    return (
      <Alert
        status="danger"
        icon
        title={t('catalogoVisual.errorCarga')}
        description={carga.error.message}
      />
    );
  }

  if (historias.length === 0) {
    return (
      <EstadoVacio
        icono={<BuscarIcon />}
        titulo={t('catalogoVisual.vacioTitulo')}
        descripcion={t('catalogoVisual.vacioDescripcion')}
      />
    );
  }

  const actual =
    historias.find(h => h.id === idActual) ??
    historias.find(h => h.niveles[0] === ORDEN[0]) ??
    historias[0];
  const raiz = `${props.base}/catalogo-visual`;
  const params = (vista: boolean) =>
    new URLSearchParams({
      story: actual.id,
      theme: tema,
      ...(vista ? { mode: 'preview' } : {}),
    }).toString();

  return (
    <div className="hrl-catalogo-visual">
      <nav
        className="hrl-catalogo-visual__nav"
        aria-label={t('catalogoVisual.navegacion')}
      >
        <SearchField
          size="small"
          aria-label={t('catalogoVisual.buscar')}
          placeholder={t('catalogoVisual.buscar')}
          value={filtro}
          onChange={setFiltro}
        />
        {grupos.length === 0 ? (
          <EstadoVacio
            compacto
            icono={<BuscarIcon />}
            titulo={t('catalogoVisual.sinResultados')}
            descripcion={t('catalogoVisual.sinResultadosAyuda')}
          />
        ) : (
          grupos.map(([grupo, componentes]) => (
            <section key={grupo} className="hrl-catalogo-visual__grupo">
              <h3>{grupo}</h3>
              {[...componentes].map(([componente, lista]) => (
                <details
                  key={componente}
                  open={Boolean(filtro) || lista.some(h => h.id === actual.id)}
                >
                  <summary>
                    {componente}
                    <span className="hrl-tabla__grupo-cuenta">
                      {lista.length}
                    </span>
                  </summary>
                  <ul>
                    {lista.map(h => (
                      <li key={h.id}>
                        <NavLink
                          to={`${raiz}/${h.id}`}
                          className={h.id === actual.id ? 'active' : undefined}
                          aria-current={h.id === actual.id ? 'page' : undefined}
                        >
                          {h.nombre}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </section>
          ))
        )}
      </nav>

      <section
        className="hrl-catalogo-visual__lienzo"
        aria-labelledby="hrl-historia"
      >
        <header className="hrl-catalogo-visual__cabecera">
          <div>
            <Text as="p" variant="body-small" color="secondary">
              {actual.niveles.join(' / ')}
            </Text>
            <Text as="h2" id="hrl-historia" variant="title-small" weight="bold">
              {actual.nombre}
            </Text>
          </div>
          <span className="hrl-catalogo-visual__acciones">
            {props.repositorio && (
              <ButtonLink
                href={`${props.repositorio}/blob/main/${actual.archivo}#L${actual.lineaInicio}-L${actual.lineaFin}`}
                target="_blank"
                rel="noopener noreferrer"
                variant="secondary"
                size="small"
                iconStart={<CodigoIcon />}
              >
                {t('catalogoVisual.verCodigo')}
              </ButtonLink>
            )}
            <ButtonLink
              href={`${carga.datos.base}?${params(false)}`}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              size="small"
              iconStart={<AbrirIcon />}
            >
              {t('catalogoVisual.pantallaCompleta')}
            </ButtonLink>
          </span>
        </header>
        <MarcoConCarga
          key={`${actual.id}-${tema}`}
          className="hrl-catalogo-visual__marco"
          title={t('catalogoVisual.marco', {
            historia: `${actual.niveles.join(' / ')} / ${actual.nombre}`,
          })}
          src={`${carga.datos.base}?${params(true)}`}
          loading="lazy"
          referrerPolicy="same-origin"
        />
      </section>
    </div>
  );
};
