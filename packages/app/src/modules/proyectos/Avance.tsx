import { Fragment } from 'react';
import { Alert, Skeleton, Text } from '@backstage/ui';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import HechoIcon from '@material-ui/icons/CheckCircle';
import PendienteIcon from '@material-ui/icons/RadioButtonUnchecked';
import PlanIcon from '@material-ui/icons/ListAltOutlined';
import EnlaceIcon from '@material-ui/icons/LaunchOutlined';
import { textosHrl } from '../idioma';
import { EstadoVacio } from '../comun/EstadoVacio';
import {
  Avance,
  Cambio,
  Entrega,
  fechaCorta,
  useAvance,
  useRepositorios,
} from './github';

/** Texto con `código` en línea, como lo escribe el plan. */
export const ConCodigo = ({ texto }: { texto: string }) => (
  <>
    {texto
      .split('`')
      .map((parte, i) =>
        i % 2 === 1 ? (
          <code key={i}>{parte}</code>
        ) : (
          <Fragment key={i}>{parte}</Fragment>
        ),
      )}
  </>
);

/** URL que se puede abrir en el navegador para una fuente `url:...`. */
const urlLegible = (fuente: string) => fuente.replace(/^url:/, '');

export const contarAvance = (avance: Avance) => {
  const vigentes = avance.entregas.filter(e => e.estado !== 'retirada');
  const completadas = vigentes.filter(e => e.estado === 'completada').length;
  return {
    completadas,
    pendientes: vigentes.length - completadas,
    total: vigentes.length,
    retiradas: avance.entregas.length - vigentes.length,
  };
};

/** Barra «18 de 30 funciones completas». */
export const BarraAvance = ({ avance }: { avance: Avance }) => {
  const { t } = useTranslationRef(textosHrl);
  const c = contarAvance(avance);
  const proporcion = c.total === 0 ? 0 : c.completadas / c.total;
  return (
    <div className="hrl-avance-barra">
      <div className="hrl-avance-barra__cifras">
        <strong>
          {c.total === 0
            ? t('cifra.sinDatos')
            : `${Math.round(proporcion * 100)} %`}
        </strong>
        <span>
          {t('avance.resumen', {
            completadas: String(c.completadas),
            total: String(c.total),
          })}
        </span>
      </div>
      <span className="hrl-avance-barra__pista" aria-hidden>
        <span style={{ width: `${proporcion * 100}%` }} />
      </span>
    </div>
  );
};

/** Una lista de entregas agrupadas por fase, sin tarjetas. */
const ListaEntregas = (props: {
  entregas: Entrega[];
  completadas: boolean;
}) => {
  const { t } = useTranslationRef(textosHrl);
  const porFase = new Map<string, Entrega[]>();
  for (const e of props.entregas) {
    porFase.set(e.fase, [...(porFase.get(e.fase) ?? []), e]);
  }
  if (props.entregas.length === 0) {
    return (
      <Text as="p" variant="body-small" color="secondary">
        {props.completadas
          ? t('avance.ningunaCompletada')
          : t('avance.ningunaPendiente')}
      </Text>
    );
  }
  return (
    <div className="hrl-entregas">
      {[...porFase].map(([fase, entregas]) => (
        <div key={fase} className="hrl-entregas__fase">
          <h4>{fase}</h4>
          <ul>
            {entregas.map(e => (
              <li key={`${e.fase}-${e.id}`} data-estado={e.estado}>
                {props.completadas ? (
                  <HechoIcon aria-hidden className="hrl-entregas__icono" />
                ) : (
                  <PendienteIcon aria-hidden className="hrl-entregas__icono" />
                )}
                <span>
                  <span className="hrl-entregas__texto">
                    <ConCodigo texto={e.texto} />
                  </span>
                  {/* Lo que el plan dice además del estado: «bloqueado para…». */}
                  {!props.completadas && e.detalle !== '[pendiente]' && (
                    <span className="hrl-entregas__detalle">
                      <ConCodigo texto={e.detalle} />
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

/** Lo último integrado en los repositorios del proyecto. */
export const UltimosCambios = (props: {
  cambios: (Cambio & { repo: string })[];
  limite?: number;
}) => {
  const { t } = useTranslationRef(textosHrl);
  const lista = [...props.cambios]
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .slice(0, props.limite ?? 8);
  if (lista.length === 0) {
    return (
      <Text as="p" variant="body-small" color="secondary">
        {t('avance.sinCambios')}
      </Text>
    );
  }
  return (
    <ol className="hrl-cambios">
      {lista.map(c => (
        <li key={c.url}>
          <a href={c.url} target="_blank" rel="noopener noreferrer">
            {c.titulo}
          </a>
          <span>
            {fechaCorta(c.fecha)}
            {c.autor ? ` · ${c.autor}` : ''} · {c.repo}
          </span>
        </li>
      ))}
    </ol>
  );
};

/**
 * Pestaña «Avance»: qué funciones del sistema ya están y cuáles faltan, según
 * el plan del propio repositorio. No asigna tareas: sirve para entender de
 * un vistazo qué tan completo está el sistema.
 */
export const PestanaAvance = ({ sistema }: { sistema: string }) => {
  const { t } = useTranslationRef(textosHrl);
  const carga = useAvance(sistema);
  const repos = useRepositorios(sistema);

  if (carga.estado === 'cargando')
    return <Skeleton width="100%" height={320} />;
  if (carga.estado === 'error') {
    return (
      <Alert
        status="danger"
        icon
        title={t('avance.errorCarga')}
        description={carga.error.message}
      />
    );
  }
  const { avance } = carga.datos;
  if (!avance) {
    return (
      <EstadoVacio
        icono={<PlanIcon />}
        titulo={
          carga.datos.error
            ? t('avance.noLeidoTitulo')
            : t('avance.sinPlanTitulo')
        }
        descripcion={
          carga.datos.error
            ? t('avance.noLeidoDescripcion', { error: carga.datos.error })
            : t('avance.sinPlanDescripcion')
        }
      />
    );
  }

  const pendientes = avance.entregas.filter(e => e.estado === 'pendiente');
  const completadas = avance.entregas.filter(e => e.estado === 'completada');
  const c = contarAvance(avance);
  const cambios =
    repos.estado === 'listo'
      ? repos.datos.repositorios.flatMap(r =>
          r.cambios.map(x => ({ ...x, repo: r.slug })),
        )
      : [];

  return (
    <div className="hrl-seccion">
      <div className="hrl-avance-cabecera">
        <BarraAvance avance={avance} />
        <a
          className="hrl-enlace-flecha"
          href={urlLegible(avance.fuente)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <EnlaceIcon aria-hidden fontSize="inherit" /> {t('avance.fuente')}
        </a>
      </div>
      <Text as="p" variant="body-small" color="secondary">
        {t('avance.ayuda')}
        {c.retiradas > 0 &&
          ` ${t('avance.retiradas', { cuenta: String(c.retiradas) })}`}
      </Text>

      <div className="hrl-avance-columnas">
        <section aria-labelledby="hrl-avance-pendientes">
          <h3 id="hrl-avance-pendientes" className="hrl-avance-titulo">
            {t('avance.pendientes')}
            <span className="hrl-tabla__grupo-cuenta">{pendientes.length}</span>
          </h3>
          <ListaEntregas entregas={pendientes} completadas={false} />
        </section>
        <section aria-labelledby="hrl-avance-completadas">
          <h3 id="hrl-avance-completadas" className="hrl-avance-titulo">
            {t('avance.completadas')}
            <span className="hrl-tabla__grupo-cuenta">
              {completadas.length}
            </span>
          </h3>
          <ListaEntregas entregas={completadas} completadas />
        </section>
      </div>

      <section className="hrl-seccion" aria-labelledby="hrl-avance-ultimo">
        <h3 id="hrl-avance-ultimo" className="hrl-avance-titulo">
          {t('avance.ultimo')}
        </h3>
        <Text as="p" variant="body-small" color="secondary">
          {t('avance.ultimoAyuda')}
        </Text>
        {repos.estado === 'cargando' ? (
          <Skeleton width="100%" height={120} />
        ) : (
          <UltimosCambios cambios={cambios} />
        )}
      </section>
    </div>
  );
};
