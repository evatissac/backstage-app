import { ReactNode } from 'react';
import { Alert, ButtonLink, Skeleton, Text } from '@backstage/ui';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { useTheme } from '@material-ui/core/styles';
import OpenIcon from '@material-ui/icons/OpenInNew';
import PendienteIcon from '@material-ui/icons/HourglassEmptyOutlined';
import FichaIcon from '@material-ui/icons/DescriptionOutlined';
import GrafoIcon from '@material-ui/icons/AccountTreeOutlined';
import DriveIcon from '@material-ui/icons/FolderSharedOutlined';
import LinkIcon from '@material-ui/icons/LaunchOutlined';
import { textosHrl } from '../idioma';
import {
  Cargando,
  EsqueletoLineas,
  MarcoConCarga,
} from '../comun/Esqueletos';
import { EstadoVacio } from '../comun/EstadoVacio';
import { CAPAS_FICHA, Diagrama, Ficha, rutaFicha, useFicha } from './ficha';
import '../comun/comun.css';
import './proyectos.css';

/** Carga la ficha y resuelve los estados de carga, error y ausencia. */
const ConFicha = (props: {
  sistema: string;
  children: (ficha: Ficha) => ReactNode;
}) => {
  const { t } = useTranslationRef(textosHrl);
  const carga = useFicha(props.sistema);
  if (carga.estado === 'cargando') {
    return (
      <Cargando className="hrl-seccion">
        <Skeleton width="30%" height={22} />
        <EsqueletoLineas lineas={2} />
        <Skeleton width="100%" height={360} />
      </Cargando>
    );
  }
  if (carga.estado === 'error') {
    return (
      <Alert
        status="danger"
        icon
        title={t('ficha.errorCarga')}
        description={carga.error.message}
      />
    );
  }
  if (!carga.datos) {
    return (
      <EstadoVacio
        icono={<FichaIcon />}
        titulo={t('ficha.sinFichaTitulo')}
        descripcion={t('ficha.sinFichaDescripcion', {
          ruta: `packages/app/public/fichas/${props.sistema}/ficha.json`,
        })}
      />
    );
  }
  return <>{props.children(carga.datos)}</>;
};

/** Aviso de un dato que falta: dice qué completar y dónde. */
export const Pendiente = (props: { titulo: string; detalle: string }) => {
  const { t } = useTranslationRef(textosHrl);
  return (
    <div className="hrl-pendiente" role="note">
      <PendienteIcon className="hrl-pendiente__icono" aria-hidden />
      <div>
        <p className="hrl-pendiente__etiqueta">{t('ficha.pendiente')}</p>
        <p className="hrl-pendiente__titulo">{props.titulo}</p>
        <p className="hrl-pendiente__detalle">{props.detalle}</p>
      </div>
    </div>
  );
};

/**
 * Diagrama de archify incrustado. `embed=1` oculta la barra del visor (que
 * está en inglés) y `theme` lo alinea con el tema del portal.
 */
const VistaDiagrama = (props: {
  sistema: string;
  diagrama: Diagrama;
  titulo: string;
}) => {
  const { t } = useTranslationRef(textosHrl);
  const tema = useTheme().palette.type === 'dark' ? 'dark' : 'light';
  const base = rutaFicha(props.sistema, props.diagrama.archivo);
  return (
    <figure className="hrl-tarjeta hrl-diagrama">
      <figcaption className="hrl-diagrama__cabecera">
        <Text as="h2" variant="title-x-small" weight="bold">
          {props.titulo}
        </Text>
        <ButtonLink
          href={`${base}?theme=${tema}`}
          target="_blank"
          rel="noopener"
          variant="tertiary"
          size="small"
          iconEnd={<OpenIcon />}
        >
          {t('ficha.pantallaCompleta')}
        </ButtonLink>
      </figcaption>
      <MarcoConCarga
        key={tema}
        className="hrl-diagrama__marco"
        title={props.titulo}
        src={`${base}?embed=1&theme=${tema}`}
        loading="lazy"
        style={{
          aspectRatio: `${props.diagrama.ancho} / ${props.diagrama.alto}`,
        }}
      />
      <p className="hrl-diagrama__pista">{t('ficha.pistaMovil')}</p>
    </figure>
  );
};

const Fuentes = ({ ficha }: { ficha: Ficha }) => {
  const { t } = useTranslationRef(textosHrl);
  return (
    <p className="hrl-fuentes">
      {t('ficha.fuentes', { fecha: ficha.actualizado })}{' '}
      {ficha.fuentes.map((f, i) => (
        <span key={f}>
          {i > 0 && ' · '}
          <code>{f}</code>
        </span>
      ))}
    </p>
  );
};

export const PestanaArquitectura = ({ sistema }: { sistema: string }) => {
  const { t } = useTranslationRef(textosHrl);
  const grafo = `/catalog-graph?rootEntityRefs%5B%5D=${encodeURIComponent(
    `system:default/${sistema}`,
  )}`;
  return (
    <ConFicha sistema={sistema}>
      {ficha =>
        ficha.arquitectura ? (
          <div className="hrl-seccion">
            <VistaDiagrama
              sistema={sistema}
              diagrama={ficha.arquitectura.diagrama}
              titulo={t('ficha.arquitecturaTitulo')}
            />
            <div className="hrl-columnas">
              <section className="hrl-tarjeta">
                <Text as="h2" variant="title-x-small" weight="bold">
                  {t('ficha.comoLeerlo')}
                </Text>
                <ol className="hrl-puntos">
                  {ficha.arquitectura.puntos.map(p => (
                    <li key={p}>{p}</li>
                  ))}
                </ol>
              </section>
              <section className="hrl-tarjeta">
                <Text as="h2" variant="title-x-small" weight="bold">
                  {t('ficha.grafoTitulo')}
                </Text>
                <Text as="p" variant="body-small" color="secondary">
                  {t('ficha.grafoTexto')}
                </Text>
                <ButtonLink
                  href={grafo}
                  variant="secondary"
                  size="small"
                  iconStart={<GrafoIcon />}
                >
                  {t('ficha.verGrafo')}
                </ButtonLink>
              </section>
            </div>
            <Fuentes ficha={ficha} />
          </div>
        ) : (
          <Pendiente
            titulo={t('ficha.faltaDiagrama')}
            detalle={t('ficha.faltaDiagramaDetalle')}
          />
        )
      }
    </ConFicha>
  );
};

export const PestanaTecnologias = ({ sistema }: { sistema: string }) => {
  const { t } = useTranslationRef(textosHrl);
  return (
    <ConFicha sistema={sistema}>
      {ficha => (
        <div className="hrl-seccion">
          <div className="hrl-intro">
            <Text as="p" variant="body-medium" color="secondary">
              {t('ficha.tecnologiasIntro')}
            </Text>
          </div>
          <div className="hrl-capas-ficha">
            {CAPAS_FICHA.map(capa => {
              const items = ficha.tecnologias.filter(x => x.capa === capa);
              if (items.length === 0) return null;
              return (
                <section key={capa} className="hrl-tarjeta hrl-capa">
                  <p className="hrl-capa__nombre">
                    {t(`ficha.capas.${capa}` as const)}
                  </p>
                  <ul className="hrl-tecnologias">
                    {items.map(x => (
                      <li key={x.nombre}>
                        <span className="hrl-tecnologias__cabecera">
                          <strong>{x.nombre}</strong>
                          <span
                            className="hrl-version"
                            data-sin-version={x.version === null}
                          >
                            {x.version ?? t('ficha.sinVersion')}
                          </span>
                        </span>
                        <span className="hrl-tecnologias__uso">{x.uso}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
          <Text as="p" variant="body-x-small" color="secondary">
            {t('ficha.sinVersionNota')}
          </Text>
          <Fuentes ficha={ficha} />
        </div>
      )}
    </ConFicha>
  );
};

export const PestanaDespliegue = ({ sistema }: { sistema: string }) => {
  const { t } = useTranslationRef(textosHrl);
  return (
    <ConFicha sistema={sistema}>
      {ficha => {
        const d = ficha.despliegue;
        if (!d) {
          return (
            <Pendiente
              titulo={t('ficha.faltaDespliegue')}
              detalle={t('ficha.faltaDiagramaDetalle')}
            />
          );
        }
        return (
          <div className="hrl-seccion">
            <VistaDiagrama
              sistema={sistema}
              diagrama={d.diagrama}
              titulo={t('ficha.despliegueTitulo')}
            />

            <div className="hrl-columnas">
              <section className="hrl-tarjeta">
                <Text as="h2" variant="title-x-small" weight="bold">
                  {t('ficha.entornos')}
                </Text>
                <ul className="hrl-entornos">
                  {d.entornos.map(e => (
                    <li key={e.nombre}>
                      <span className="hrl-entornos__nombre">{e.nombre}</span>
                      <span className="hrl-entornos__texto">
                        {e.descripcion}
                        {e.url && (
                          <a
                            href={e.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {e.url}
                          </a>
                        )}
                        {e.pendiente && (
                          <span className="hrl-falta">{e.pendiente}</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="hrl-tarjeta">
                <Text as="h2" variant="title-x-small" weight="bold">
                  {t('ficha.exposicion')}
                </Text>
                <p className="hrl-capa__nombre">{t('ficha.expuesto')}</p>
                <ul className="hrl-puntos hrl-puntos--compactos">
                  {d.expuesto.map(x => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
                <p className="hrl-capa__nombre">{t('ficha.interno')}</p>
                <ul className="hrl-puntos hrl-puntos--compactos">
                  {d.interno.map(x => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </section>
            </div>

            <div className="hrl-columnas">
              <section className="hrl-tarjeta">
                <Text as="h2" variant="title-x-small" weight="bold">
                  {t('ficha.variables')}
                </Text>
                <dl className="hrl-variables">
                  {d.variables.map(v => (
                    <div key={v.nombre}>
                      <dt>
                        <code>{v.nombre}</code>
                      </dt>
                      <dd>{v.uso}</dd>
                    </div>
                  ))}
                </dl>
                <Text as="p" variant="body-x-small" color="secondary">
                  {t('ficha.variablesNota')}
                </Text>
              </section>

              <section className="hrl-tarjeta">
                <Text as="h2" variant="title-x-small" weight="bold">
                  {t('ficha.comoDesplegar')}
                </Text>
                <pre className="hrl-comandos">
                  <code>{d.comandos.join('\n')}</code>
                </pre>
                {d.guia && (
                  <ButtonLink
                    href={`/docs/default/component/${d.guia.componente}/${d.guia.pagina}/`}
                    variant="secondary"
                    size="small"
                    iconStart={<FichaIcon />}
                  >
                    {d.guia.titulo}
                  </ButtonLink>
                )}
              </section>
            </div>

            <div className="hrl-columnas">
              {d.respaldos ? (
                <section className="hrl-tarjeta">
                  <Text as="h2" variant="title-x-small" weight="bold">
                    {t('ficha.respaldos')}
                  </Text>
                  <Text as="p" variant="body-small">
                    {d.respaldos}
                  </Text>
                </section>
              ) : (
                <Pendiente
                  titulo={t('ficha.respaldos')}
                  detalle={t('ficha.faltaRespaldos')}
                />
              )}
              {d.acceso ? (
                <section className="hrl-tarjeta">
                  <Text as="h2" variant="title-x-small" weight="bold">
                    {t('ficha.acceso')}
                  </Text>
                  <Text as="p" variant="body-small">
                    {d.acceso}
                  </Text>
                </section>
              ) : (
                <Pendiente
                  titulo={t('ficha.acceso')}
                  detalle={t('ficha.faltaAcceso')}
                />
              )}
            </div>
            <Fuentes ficha={ficha} />
          </div>
        );
      }}
    </ConFicha>
  );
};

export const PestanaProcesos = ({ sistema }: { sistema: string }) => {
  const { t } = useTranslationRef(textosHrl);
  return (
    <ConFicha sistema={sistema}>
      {ficha =>
        ficha.procesos && ficha.procesos.length > 0 ? (
          <div className="hrl-seccion">
            {ficha.procesos.map(p => (
              <div key={p.titulo} className="hrl-seccion">
                <VistaDiagrama
                  sistema={sistema}
                  diagrama={p.diagrama}
                  titulo={p.titulo}
                />
                <Text as="p" variant="body-medium" color="secondary">
                  {p.descripcion}
                </Text>
                {p.pendientes.map(x => (
                  <Pendiente
                    key={x}
                    titulo={t('ficha.porConfirmar')}
                    detalle={x}
                  />
                ))}
              </div>
            ))}
            <Fuentes ficha={ficha} />
          </div>
        ) : (
          <Pendiente
            titulo={t('ficha.faltaProcesos')}
            detalle={t('ficha.faltaDiagramaDetalle')}
          />
        )
      }
    </ConFicha>
  );
};

const TIPOS_DOCUMENTO = ['normativa', 'formato', 'manual', 'acta', 'oficio'];

export const PestanaDocumentos = ({ sistema }: { sistema: string }) => {
  const { t } = useTranslationRef(textosHrl);
  return (
    <ConFicha sistema={sistema}>
      {ficha => {
        const docs = ficha.documentos;
        const lista = docs?.lista ?? [];
        const tipos = [
          ...TIPOS_DOCUMENTO.filter(tipo => lista.some(d => d.tipo === tipo)),
          ...new Set(
            lista
              .map(d => d.tipo)
              .filter(tipo => !TIPOS_DOCUMENTO.includes(tipo)),
          ),
        ];
        return (
          <div className="hrl-seccion">
            {docs?.drive ? (
              <ButtonLink
                href={docs.drive}
                target="_blank"
                rel="noopener noreferrer"
                variant="secondary"
                iconStart={<DriveIcon />}
              >
                {t('ficha.abrirDrive')}
              </ButtonLink>
            ) : (
              <Pendiente
                titulo={t('ficha.faltaDrive')}
                detalle={t('ficha.faltaDriveDetalle')}
              />
            )}

            {lista.length === 0 ? (
              <EstadoVacio
                icono={<FichaIcon />}
                titulo={t('ficha.sinDocumentosTitulo')}
                descripcion={t('ficha.sinDocumentosDescripcion')}
              />
            ) : (
              tipos.map(tipo => (
                <section key={tipo} className="hrl-seccion">
                  <p className="hrl-capa__nombre">
                    {TIPOS_DOCUMENTO.includes(tipo)
                      ? t(
                          `ficha.tiposDocumento.${tipo}` as 'ficha.tiposDocumento.normativa',
                        )
                      : tipo}
                  </p>
                  <ul className="hrl-documentos">
                    {lista
                      .filter(d => d.tipo === tipo)
                      .map(d => (
                        <li
                          key={d.titulo}
                          className="hrl-tarjeta hrl-documento"
                        >
                          <span className="hrl-documento__formato" aria-hidden>
                            {d.archivo.toUpperCase()}
                          </span>
                          <span className="hrl-documento__texto">
                            <strong>{d.titulo}</strong>
                            <span>{d.descripcion}</span>
                            <span className="hrl-sr">
                              {t('ficha.formato', { formato: d.archivo })}
                            </span>
                          </span>
                          {d.url ? (
                            <ButtonLink
                              href={d.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              variant="secondary"
                              size="small"
                              iconEnd={<LinkIcon />}
                            >
                              {t('ficha.abrir')}
                            </ButtonLink>
                          ) : (
                            <span className="hrl-falta">
                              {t('ficha.faltaEnlace')}
                            </span>
                          )}
                        </li>
                      ))}
                  </ul>
                </section>
              ))
            )}
            <Fuentes ficha={ficha} />
          </div>
        );
      }}
    </ConFicha>
  );
};
