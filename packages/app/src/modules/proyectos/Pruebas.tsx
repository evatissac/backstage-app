import { Alert, Skeleton, Text } from '@backstage/ui';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import ExitoIcon from '@material-ui/icons/CheckCircle';
import FalloIcon from '@material-ui/icons/Cancel';
import EnCursoIcon from '@material-ui/icons/Autorenew';
import OtroIcon from '@material-ui/icons/RemoveCircleOutline';
import PruebasIcon from '@material-ui/icons/BugReportOutlined';
import { textosHrl } from '../idioma';
import { EstadoVacio } from '../comun/EstadoVacio';
import { Etiqueta, Tono } from '../comun/Etiqueta';
import { ResumenCalidad, TablaCalidad, useCalidad } from '../calidad';
import {
  Ejecucion,
  fechaCorta,
  Repositorio,
  ultimasPorFlujo,
  useRepositorios,
} from './github';

// Las claves de resultado se arman con la conclusión de GitHub.
type ClaveResultado = 'pruebas.resultado.success';

/** Tono, icono y texto de una ejecución: el color nunca va solo. */
export const resultadoEjecucion = (e: Ejecucion) => {
  if (e.estado !== 'completed') {
    return { tono: 'info' as Tono, icono: <EnCursoIcon />, clave: 'en_curso' };
  }
  switch (e.conclusion) {
    case 'success':
      return { tono: 'ok' as Tono, icono: <ExitoIcon />, clave: 'success' };
    case 'failure':
    case 'timed_out':
      return {
        tono: 'peligro' as Tono,
        icono: <FalloIcon />,
        clave: 'failure',
      };
    default:
      return { tono: 'neutro' as Tono, icono: <OtroIcon />, clave: 'otro' };
  }
};

export const EtiquetaEjecucion = ({ e }: { e: Ejecucion }) => {
  const { t } = useTranslationRef(textosHrl);
  const r = resultadoEjecucion(e);
  return (
    <Etiqueta
      tono={r.tono}
      icono={r.icono}
      texto={t(`pruebas.resultado.${r.clave}` as ClaveResultado)}
    />
  );
};

const PruebasRepo = ({ repo }: { repo: Repositorio }) => {
  const { t } = useTranslationRef(textosHrl);
  const ultimas = ultimasPorFlujo(repo.pruebas.ejecuciones);
  return (
    <section className="hrl-seccion" aria-label={repo.slug}>
      <Text as="h3" variant="title-x-small" weight="bold">
        {repo.slug}
      </Text>
      {!repo.pruebas.configuradas || ultimas.length === 0 ? (
        <Text as="p" variant="body-small" color="secondary">
          {t('pruebas.sinCi')}
        </Text>
      ) : (
        <ul className="hrl-ejecuciones">
          {ultimas.map(e => (
            <li key={e.url}>
              <EtiquetaEjecucion e={e} />
              <a href={e.url} target="_blank" rel="noopener noreferrer">
                {e.flujo}
              </a>
              <span>
                {e.rama} · {fechaCorta(e.fecha)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

/**
 * Pestaña «Calidad y pruebas»: el último resultado de las pruebas
 * automáticas de cada repositorio y las comprobaciones de calidad de cada
 * componente.
 */
export const PestanaCalidadPruebas = ({ sistema }: { sistema: string }) => {
  const { t } = useTranslationRef(textosHrl);
  const repos = useRepositorios(sistema);
  const calidad = useCalidad(sistema);
  const conCi =
    repos.estado === 'listo'
      ? repos.datos.repositorios.filter(r => r.pruebas.configuradas)
      : [];
  return (
    <div className="hrl-seccion">
      <section className="hrl-seccion" aria-labelledby="hrl-pruebas">
        <div className="hrl-intro">
          <Text as="h2" id="hrl-pruebas" variant="title-small" weight="bold">
            {t('pruebas.titulo')}
          </Text>
          <Text as="p" variant="body-small" color="secondary">
            {t('pruebas.ayuda')}
          </Text>
        </div>
        {repos.estado === 'cargando' && <Skeleton width="100%" height={120} />}
        {repos.estado === 'error' && (
          <Alert
            status="danger"
            icon
            title={t('pruebas.errorCarga')}
            description={repos.error.message}
          />
        )}
        {repos.estado === 'listo' &&
          (conCi.length === 0 ? (
            <EstadoVacio
              compacto
              icono={<PruebasIcon />}
              titulo={t('pruebas.sinCiTitulo')}
              descripcion={t('pruebas.sinCiDescripcion')}
            />
          ) : (
            repos.datos.repositorios.map(r => (
              <PruebasRepo key={r.slug} repo={r} />
            ))
          ))}
      </section>

      <section className="hrl-seccion" aria-labelledby="hrl-calidad-proyecto">
        <div className="hrl-intro">
          <Text
            as="h2"
            id="hrl-calidad-proyecto"
            variant="title-small"
            weight="bold"
          >
            {t('calidad.titulo')}
          </Text>
          <Text as="p" variant="body-small" color="secondary">
            {t('calidad.intro')}
          </Text>
        </div>
        {calidad.estado === 'listo' && calidad.datos.length > 0 && (
          <ResumenCalidad datos={calidad.datos} />
        )}
        <TablaCalidad carga={calidad} />
      </section>
    </div>
  );
};
