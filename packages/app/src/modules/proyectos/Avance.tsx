import { Fragment } from 'react';
import { Alert, Skeleton, Text } from '@backstage/ui';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import HechoIcon from '@material-ui/icons/CheckCircle';
import PendienteIcon from '@material-ui/icons/RadioButtonUnchecked';
import PlanIcon from '@material-ui/icons/ListAltOutlined';
import EnlaceIcon from '@material-ui/icons/LaunchOutlined';
import { textosHrl } from '../idioma';
import { EstadoVacio } from '../comun/EstadoVacio';
import { Avance, Entrega, useAvance } from './github';

/** Texto con `código` en línea, como lo escribe el plan. */
const ConCodigo = ({ texto }: { texto: string }) => (
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

const contarAvance = (avance: Avance) => {
  const vigentes = avance.entregas.filter(e => e.estado !== 'retirada');
  const completadas = vigentes.filter(e => e.estado === 'completada').length;
  return {
    completadas,
    total: vigentes.length,
    retiradas: avance.entregas.length - vigentes.length,
  };
};

/** Cifra «71 % · 25 de 35 funciones completadas». */
const BarraAvance = ({ avance }: { avance: Avance }) => {
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
    </div>
  );
};

/** Un cuadro con las entregas de un estado, agrupadas por fase. */
const Cuadro = (props: {
  id: string;
  titulo: string;
  entregas: Entrega[];
  completadas: boolean;
  vacio: string;
}) => {
  const porFase = new Map<string, Entrega[]>();
  for (const e of props.entregas) {
    porFase.set(e.fase, [...(porFase.get(e.fase) ?? []), e]);
  }
  return (
    <section
      className="hrl-tarjeta hrl-cuadro-avance"
      aria-labelledby={props.id}
    >
      <h2 id={props.id} className="hrl-avance-titulo">
        {props.titulo}
        <span className="hrl-tabla__grupo-cuenta">{props.entregas.length}</span>
      </h2>
      {props.entregas.length === 0 ? (
        <Text as="p" variant="body-small" color="secondary">
          {props.vacio}
        </Text>
      ) : (
        <div className="hrl-entregas">
          {[...porFase].map(([fase, entregas]) => (
            <div key={fase} className="hrl-entregas__fase">
              <h3>{fase}</h3>
              <ul>
                {entregas.map(e => (
                  <li key={`${e.fase}-${e.id}`} data-estado={e.estado}>
                    {props.completadas ? (
                      <HechoIcon aria-hidden className="hrl-entregas__icono" />
                    ) : (
                      <PendienteIcon
                        aria-hidden
                        className="hrl-entregas__icono"
                      />
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
      )}
    </section>
  );
};

/**
 * Resumen del proyecto: cuánto está hecho y dos cuadros, lo que falta y lo
 * que ya está, según el plan del propio repositorio. No asigna tareas: sirve
 * para entender de un vistazo qué tan completo está el sistema.
 */
export const ResumenAvance = ({ sistema }: { sistema: string }) => {
  const { t } = useTranslationRef(textosHrl);
  const carga = useAvance(sistema);

  if (carga.estado === 'cargando') {
    return <Skeleton width="100%" height={320} />;
  }
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

  const c = contarAvance(avance);
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
        <Cuadro
          id="hrl-avance-pendientes"
          titulo={t('avance.pendientes')}
          entregas={avance.entregas.filter(e => e.estado === 'pendiente')}
          completadas={false}
          vacio={t('avance.ningunaPendiente')}
        />
        <Cuadro
          id="hrl-avance-completadas"
          titulo={t('avance.completadas')}
          entregas={avance.entregas.filter(e => e.estado === 'completada')}
          completadas
          vacio={t('avance.ningunaCompletada')}
        />
      </div>
    </div>
  );
};
