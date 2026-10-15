import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, Skeleton, Text } from '@backstage/ui';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import ArrowIcon from '@material-ui/icons/ArrowForward';
import { textosHrl } from '../idioma';
import { Etiqueta } from '../comun/Etiqueta';
import { tieneDocs } from '../comun/entidades';
import { useCalidad } from '../calidad';
import { DetalleProyecto } from './datos';
import { useFicha } from './ficha';
import { ultimasPorFlujo, useAvance, useRepositorios } from './github';
import { BarraAvance, ConCodigo, UltimosCambios } from './Avance';
import { EtiquetaEjecucion } from './Pruebas';

/** Un paso del recorrido: una pregunta, lo que el portal sabe y adónde ir. */
const Paso = (props: {
  numero: number;
  titulo: string;
  pregunta: string;
  href: string;
  enlace: string;
  children: ReactNode;
}) => (
  <li className="hrl-paso">
    <span className="hrl-paso__numero" aria-hidden>
      {props.numero}
    </span>
    <div className="hrl-paso__cuerpo">
      <div className="hrl-paso__cabecera">
        <Text as="h3" variant="title-x-small" weight="bold">
          {props.titulo}
        </Text>
        <Text as="p" variant="body-small" color="secondary">
          {props.pregunta}
        </Text>
      </div>
      <div className="hrl-paso__contenido">{props.children}</div>
      <Link to={props.href} className="hrl-enlace-flecha">
        {props.enlace} <ArrowIcon aria-hidden fontSize="inherit" />
      </Link>
    </div>
  </li>
);

const Cargando = () => <Skeleton width="60%" height={20} />;

/**
 * Resumen del proyecto como recorrido: seis preguntas en el orden en que
 * alguien nuevo las haría, cada una con lo que el portal sabe y un enlace a
 * la pestaña que la responde a fondo.
 */
export const Recorrido = (props: { d: DetalleProyecto; base: string }) => {
  const { t } = useTranslationRef(textosHrl);
  const { d, base } = props;
  const nombre = d.sistema.metadata.name;
  const ficha = useFicha(nombre);
  const avance = useAvance(nombre);
  const repos = useRepositorios(nombre);
  const calidad = useCalidad(nombre);

  const f = ficha.estado === 'listo' ? ficha.datos : undefined;
  const diagramas = f
    ? [
        f.arquitectura?.diagrama,
        f.despliegue?.diagrama,
        ...(f.procesos ?? []).map(p => p.diagrama),
      ].filter(Boolean).length
    : 0;
  const docsTecnicos = [d.sistema, ...d.componentes, ...d.apis].filter(
    tieneDocs,
  ).length;
  const repositorios = repos.estado === 'listo' ? repos.datos.repositorios : [];
  const personas = new Map(
    repositorios.flatMap(r => r.miembros.map(m => [m.login, m] as const)),
  );
  const ejecuciones = repositorios.flatMap(r =>
    ultimasPorFlujo(r.pruebas.ejecuciones),
  );
  const cumplidas =
    calidad.estado === 'listo'
      ? calidad.datos.reduce((n, r) => n + r.cumplidas, 0)
      : 0;
  const evaluadas =
    calidad.estado === 'listo'
      ? calidad.datos.reduce((n, r) => n + r.evaluadas, 0)
      : 0;
  const plan = avance.estado === 'listo' ? avance.datos.avance : null;
  const ultimaFase = plan?.fases.filter(x => x.fecha).slice(-1)[0];
  const siguiente = plan?.entregas.find(e => e.estado === 'pendiente');

  return (
    <div className="hrl-recorrido">
      <ol className="hrl-pasos">
        <Paso
          numero={1}
          titulo={t('recorrido.queEs')}
          pregunta={t('recorrido.queEsPregunta')}
          href={`${base}/componentes`}
          enlace={t('recorrido.queEsEnlace')}
        >
          <Text as="p" variant="body-medium">
            {d.sistema.metadata.description ?? t('proyectos.sinDescripcion')}
          </Text>
          <Text as="p" variant="body-small" color="secondary">
            {t('recorrido.piezas', {
              componentes: String(d.componentes.length),
              apis: String(d.apis.length),
              recursos: String(d.recursos.length),
            })}
          </Text>
        </Paso>

        <Paso
          numero={2}
          titulo={t('recorrido.enQueVa')}
          pregunta={t('recorrido.enQueVaPregunta')}
          href={`${base}/avance`}
          enlace={t('recorrido.enQueVaEnlace')}
        >
          {avance.estado === 'cargando' && <Cargando />}
          {avance.estado !== 'cargando' && !plan && (
            <Text as="p" variant="body-small" color="secondary">
              {t('avance.sinPlanTitulo')}
            </Text>
          )}
          {plan && (
            <>
              <BarraAvance avance={plan} />
              {ultimaFase && (
                <Text as="p" variant="body-small">
                  {t('recorrido.ultimaFase', {
                    fase: ultimaFase.titulo,
                    fecha: ultimaFase.fecha ?? '',
                  })}
                </Text>
              )}
              {siguiente && (
                <Text as="p" variant="body-small" color="secondary">
                  {t('recorrido.siguiente')}{' '}
                  <ConCodigo texto={siguiente.texto} />
                </Text>
              )}
            </>
          )}
        </Paso>

        <Paso
          numero={3}
          titulo={t('recorrido.comoEsta')}
          pregunta={t('recorrido.comoEstaPregunta')}
          href={`${base}/ficha/arquitectura`}
          enlace={t('recorrido.comoEstaEnlace')}
        >
          {ficha.estado === 'cargando' && <Cargando />}
          {ficha.estado !== 'cargando' && !f && (
            <Text as="p" variant="body-small" color="secondary">
              {t('recorrido.sinFicha')}
            </Text>
          )}
          {f && (
            <>
              <span className="hrl-chips">
                {f.tecnologias.map(x => (
                  <Etiqueta
                    key={`${x.capa}-${x.nombre}`}
                    texto={x.version ? `${x.nombre} ${x.version}` : x.nombre}
                  />
                ))}
              </span>
              <Text as="p" variant="body-small" color="secondary">
                {t('recorrido.diagramas', { cuenta: String(diagramas) })}
              </Text>
            </>
          )}
        </Paso>

        <Paso
          numero={4}
          titulo={t('recorrido.dondeLeer')}
          pregunta={t('recorrido.dondeLeerPregunta')}
          href={`${base}/documentacion`}
          enlace={t('recorrido.dondeLeerEnlace')}
        >
          {repos.estado === 'cargando' ? (
            <Cargando />
          ) : (
            <Text as="p" variant="body-small">
              {t('recorrido.documentos', {
                wiki: String(docsTecnicos),
                documentos: String(f?.documentos?.lista.length ?? 0),
                repos: String(repositorios.length),
              })}
            </Text>
          )}
        </Paso>

        <Paso
          numero={5}
          titulo={t('recorrido.solidez')}
          pregunta={t('recorrido.solidezPregunta')}
          href={`${base}/calidad`}
          enlace={t('recorrido.solidezEnlace')}
        >
          {repos.estado === 'cargando' ? (
            <Cargando />
          ) : (
            <span className="hrl-chips">
              {ejecuciones.length === 0 ? (
                <Etiqueta texto={t('pruebas.sinCiCorto')} tono="aviso" />
              ) : (
                ejecuciones
                  .slice(0, 4)
                  .map(e => <EtiquetaEjecucion key={e.url} e={e} />)
              )}
            </span>
          )}
          <Text as="p" variant="body-small" color="secondary">
            {evaluadas === 0
              ? t('calidad.sinEvaluar')
              : t('recorrido.calidad', {
                  cumplidas: String(cumplidas),
                  total: String(evaluadas),
                })}
          </Text>
        </Paso>

        <Paso
          numero={6}
          titulo={t('recorrido.quienes')}
          pregunta={t('recorrido.quienesPregunta')}
          href={`${base}/miembros`}
          enlace={t('recorrido.quienesEnlace')}
        >
          {repos.estado === 'cargando' ? (
            <Cargando />
          ) : (
            <>
              <span className="hrl-avatares">
                {[...personas.values()].slice(0, 10).map(m => (
                  <Avatar
                    key={m.login}
                    src={m.avatar}
                    name={m.login}
                    size="small"
                    purpose="informative"
                  />
                ))}
              </span>
              <Text as="p" variant="body-small" color="secondary">
                {t('miembros.resumen', {
                  personas: String(personas.size),
                  repos: String(repositorios.length),
                })}
              </Text>
            </>
          )}
        </Paso>
      </ol>

      <aside className="hrl-tarjeta hrl-recorrido__lateral">
        <Text as="h2" variant="title-x-small" weight="bold">
          {t('avance.ultimo')}
        </Text>
        {repos.estado === 'cargando' ? (
          <Skeleton width="100%" height={160} />
        ) : (
          <UltimosCambios
            limite={6}
            cambios={repositorios.flatMap(r =>
              r.cambios.map(c => ({ ...c, repo: r.slug })),
            )}
          />
        )}
      </aside>
    </div>
  );
};
