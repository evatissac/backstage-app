import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ButtonLink, Skeleton, Text } from '@backstage/ui';
import { useApi, useTranslationRef } from '@backstage/frontend-plugin-api';
import { catalogApiRef, useEntity } from '@backstage/plugin-catalog-react';
import CodigoIcon from '@material-ui/icons/CodeOutlined';
import DocIcon from '@material-ui/icons/DescriptionOutlined';
import EditarIcon from '@material-ui/icons/EditOutlined';
import AccionIcon from '@material-ui/icons/FlashOnOutlined';
import { textosHrl } from '../idioma';
import { useCarga } from '../comun/useCarga';
import { Etiqueta, estiloCiclo } from '../comun/Etiqueta';
import {
  colorProyecto,
  Entidad,
  iniciales,
  partesRef,
  relaciones,
  rutaDocs,
  rutaEntidad,
  rutaProyecto,
  tieneDocs,
  tituloDe,
} from '../comun/entidades';
import {
  EstadoReglaIcono,
  estadoDato,
  Insignia,
  textoRegla,
} from '../calidad/componentes';
import { useCalidadEntidad } from '../calidad/datos';
import { NIVELES, pendientes, REGLAS } from '../calidad/reglas';
import {
  accionesPara,
  prellenado,
  rutaPlantilla,
  usePlantillas,
} from '../autoservicio/datos';
import './entidad.css';

const conCalidad = (e: Entidad) =>
  ['component', 'api'].includes(e.kind.toLowerCase());

/** Fila «etiqueta: valor» de la tarjeta de contexto. */
const Dato = (props: { etiqueta: string; children: ReactNode }) => (
  <div className="hrl-contexto__dato">
    <dt>{props.etiqueta}</dt>
    <dd>{props.children}</dd>
  </div>
);

/** Url del repositorio a partir de `backstage.io/source-location`. */
const urlFuente = (e: Entidad) =>
  e.metadata.annotations?.['backstage.io/source-location']?.replace(
    /^url:/,
    '',
  );

const NivelContexto = ({ entidad }: { entidad: Entidad }) => {
  const { t } = useTranslationRef(textosHrl);
  const carga = useCalidadEntidad(entidad);
  return (
    <Dato etiqueta={t('entidad.nivel')}>
      {carga.estado === 'cargando' && <Skeleton width={80} />}
      {carga.estado === 'listo' && (
        <Link to={`${rutaEntidad(entidad)}/calidad`}>
          <Insignia
            nivel={carga.datos.nivel}
            sinEvaluar={carga.datos.sinEvaluar}
          />
        </Link>
      )}
      {carga.estado === 'error' && t('calidad.sinDatos')}
    </Dato>
  );
};

/**
 * «Contexto» (columna derecha de la ficha, como el Catalog context de Port):
 * las propiedades que responden «qué es y de quién es» de un vistazo.
 * Reemplaza la tarjeta «Acerca de» de Backstage.
 */
export const TarjetaContexto = () => {
  const { t } = useTranslationRef(textosHrl);
  const { entity } = useEntity();
  const catalogo = useApi(catalogApiRef);
  const refSistema =
    entity.kind.toLowerCase() === 'system'
      ? undefined
      : relaciones(entity, 'partOf').find(r => r.startsWith('system:'));
  const sistema = useCarga(
    async () => (refSistema ? catalogo.getEntityByRef(refSistema) : undefined),
    [catalogo, refSistema],
  );
  const spec = (entity.spec ?? {}) as { type?: string; lifecycle?: string };
  const responsables = relaciones(entity, 'ownedBy');
  const fuente = urlFuente(entity);
  const editar = entity.metadata.annotations?.['backstage.io/edit-url'];
  const etiquetas = entity.metadata.tags ?? [];

  return (
    <section
      className="hrl-tarjeta hrl-contexto"
      aria-labelledby="hrl-contexto"
    >
      <Text as="h2" id="hrl-contexto" variant="title-x-small" weight="bold">
        {t('entidad.contexto')}
      </Text>
      <dl>
        {refSistema && (
          <Dato etiqueta={t('entidad.proyecto')}>
            {sistema.estado === 'cargando' && <Skeleton width={120} />}
            {sistema.estado === 'listo' && sistema.datos && (
              <Link
                to={rutaProyecto(sistema.datos)}
                className="hrl-contexto__proyecto"
              >
                <span
                  className="hrl-contexto__monograma"
                  style={{ background: colorProyecto(sistema.datos) }}
                  aria-hidden
                >
                  {iniciales(tituloDe(sistema.datos))}
                </span>
                {tituloDe(sistema.datos)}
              </Link>
            )}
          </Dato>
        )}
        <Dato etiqueta={t('entidad.clase')}>
          <Etiqueta texto={entity.kind} tono="acento" />
          {spec.type && <Etiqueta texto={spec.type} />}
        </Dato>
        {spec.lifecycle && (
          <Dato etiqueta={t('entidad.ciclo')}>
            <Etiqueta texto={spec.lifecycle} {...estiloCiclo(spec.lifecycle)} />
          </Dato>
        )}
        <Dato etiqueta={t('proyecto.responsable')}>
          {responsables.length === 0
            ? t('proyecto.sinResponsable')
            : responsables.map((r, i) => {
                const { kind, namespace, name } = partesRef(r);
                return (
                  <span key={r}>
                    {i > 0 && ', '}
                    <Link to={`/catalog/${namespace}/${kind}/${name}`}>
                      {name}
                    </Link>
                  </span>
                );
              })}
        </Dato>
        {conCalidad(entity) && <NivelContexto entidad={entity} />}
        {etiquetas.length > 0 && (
          <Dato etiqueta={t('entidad.tecnologias')}>
            {etiquetas.map(e => (
              <Etiqueta key={e} texto={e} />
            ))}
          </Dato>
        )}
      </dl>
      <div className="hrl-contexto__enlaces">
        {tieneDocs(entity) && (
          <ButtonLink
            href={rutaDocs(entity)}
            variant="secondary"
            size="small"
            iconStart={<DocIcon />}
          >
            {t('entidad.verDocumentacion')}
          </ButtonLink>
        )}
        {fuente && (
          <ButtonLink
            href={fuente}
            target="_blank"
            rel="noopener noreferrer"
            variant="secondary"
            size="small"
            iconStart={<CodigoIcon />}
          >
            {t('entidad.verCodigo')}
          </ButtonLink>
        )}
        {editar && (
          <ButtonLink
            href={editar}
            target="_blank"
            rel="noopener noreferrer"
            variant="tertiary"
            size="small"
            iconStart={<EditarIcon />}
          >
            {t('entidad.editarFicha')}
          </ButtonLink>
        )}
      </div>
    </section>
  );
};

/**
 * «Acciones»: lo que se puede hacer con esta entidad desde Autoservicio, con
 * el formulario ya completo. Solo aparece si hay acciones para su clase.
 */
export const TarjetaAcciones = () => {
  const { t } = useTranslationRef(textosHrl);
  const { entity } = useEntity();
  const carga = usePlantillas();
  if (carga.estado !== 'listo') return null;
  const acciones = accionesPara(carga.datos, entity);
  if (acciones.length === 0) return null;
  return (
    <section
      className="hrl-tarjeta hrl-contexto"
      aria-labelledby="hrl-acciones"
    >
      <Text as="h2" id="hrl-acciones" variant="title-x-small" weight="bold">
        {t('entidad.acciones')}
      </Text>
      <ul className="hrl-contexto__acciones">
        {acciones.map(p => (
          <li key={p.metadata.name}>
            <ButtonLink
              href={rutaPlantilla(p, prellenado(p, entity))}
              variant="secondary"
              iconStart={<AccionIcon />}
            >
              {tituloDe(p)}
            </ButtonLink>
          </li>
        ))}
      </ul>
    </section>
  );
};

/**
 * «Comprobaciones»: cuántas reglas cumple, en qué nivel está y qué le falta
 * para el siguiente, con cómo arreglarlo. El detalle está en la pestaña
 * Calidad.
 */
export const TarjetaComprobaciones = () => {
  const { t } = useTranslationRef(textosHrl);
  const { entity } = useEntity();
  const carga = useCalidadEntidad(entity);
  if (carga.estado === 'cargando') {
    return <Skeleton width="100%" height={160} />;
  }
  if (carga.estado === 'error') return null;
  const r = carga.datos;
  const faltan = pendientes(r);
  const siguiente = r.nivel
    ? NIVELES[NIVELES.indexOf(r.nivel) + 1]
    : NIVELES[0];
  const delSiguiente = siguiente
    ? REGLAS.filter(regla => regla.nivel === siguiente)
    : [];
  return (
    <section
      className="hrl-tarjeta hrl-comprobaciones"
      aria-labelledby="hrl-comprobaciones"
    >
      <header className="hrl-comprobaciones__cabecera">
        <div>
          <Text
            as="h2"
            id="hrl-comprobaciones"
            variant="title-x-small"
            weight="bold"
          >
            {t('entidad.comprobaciones')}
          </Text>
          <Text as="p" variant="body-small" color="secondary">
            {siguiente
              ? t('entidad.comprobacionesSiguiente', {
                  cumplidas: String(delSiguiente.length - faltan.length),
                  total: String(delSiguiente.length),
                  nivel: t(`calidad.nivel.${siguiente}` as const),
                })
              : t('calidad.todoCumplido')}
          </Text>
        </div>
        <Insignia nivel={r.nivel} sinEvaluar={r.sinEvaluar} />
      </header>
      {faltan.length > 0 && (
        <ul className="hrl-reglas">
          {delSiguiente.map(regla => {
            const estado = r.reglas[regla.id];
            return (
              <li
                key={regla.id}
                className="hrl-regla"
                data-ok={estadoDato(estado)}
              >
                <EstadoReglaIcono estado={estado} />
                <div>
                  <Text as="p" variant="body-medium" weight="bold">
                    {textoRegla(t, regla.id, 'titulo')}
                  </Text>
                  {estado === false && (
                    <p className="hrl-regla__arreglo">
                      {textoRegla(t, regla.id, 'arreglo')}
                    </p>
                  )}
                  {estado === undefined && (
                    <p className="hrl-regla__arreglo">
                      {t('calidad.sinEvaluarAyuda')}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <Link to={`${rutaEntidad(entity)}/calidad`} className="hrl-enlace-flecha">
        {t('entidad.verCalidad')}
      </Link>
    </section>
  );
};

export const filtroCalidad = conCalidad;
