import { CSSProperties, IframeHTMLAttributes, ReactNode, useState } from 'react';
import { Skeleton, VisuallyHidden } from '@backstage/ui';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { textosHrl } from '../idioma';
import './esqueletos.css';

/*
 * Pantallas de carga con la forma del contenido que reemplazan: al llegar los
 * datos nada salta de sitio y se entiende qué se está cargando. Los giradores
 * quedan para lo que no tiene forma propia: una búsqueda en curso, un iframe
 * que todavía no pinta o un botón que espera respuesta.
 */

/**
 * Contenedor de cualquier esqueleto: lo anuncia una vez a los lectores de
 * pantalla y oculta las formas, que no dicen nada por sí solas.
 */
export const Cargando = (props: {
  children: ReactNode;
  etiqueta?: string;
  className?: string;
  style?: CSSProperties;
}) => {
  const { t } = useTranslationRef(textosHrl);
  return (
    <div
      role="status"
      aria-busy="true"
      className={props.className}
      style={props.style}
    >
      <VisuallyHidden>{props.etiqueta ?? t('carga.cargando')}</VisuallyHidden>
      <div aria-hidden className="hrl-esq__formas">
        {props.children}
      </div>
    </div>
  );
};

// Anchos fijos y algo irregulares: un párrafo real nunca termina parejo.
const ANCHOS = ['92%', '78%', '85%', '64%', '88%', '70%'];

/** Líneas de texto; la última más corta, como el final de un párrafo. */
export const EsqueletoLineas = (props: { lineas?: number; alto?: number }) => {
  const lineas = props.lineas ?? 3;
  return (
    <div className="hrl-esq__lineas">
      {Array.from({ length: lineas }, (_, i) => (
        <Skeleton
          key={i}
          width={i === lineas - 1 && lineas > 1 ? '48%' : ANCHOS[i % 6]}
          height={props.alto ?? 14}
        />
      ))}
    </div>
  );
};

/** Filas con icono, título, detalle y, opcionalmente, un dato a la derecha. */
export const EsqueletoLista = (props: {
  filas?: number;
  dato?: boolean;
  redondo?: boolean;
}) => (
  <ul className="hrl-esq__lista">
    {Array.from({ length: props.filas ?? 5 }, (_, i) => (
      <li key={i} className="hrl-esq__fila">
        <Skeleton width={32} height={32} rounded={props.redondo} />
        <span className="hrl-esq__fila-texto">
          <Skeleton width={ANCHOS[i % 6]} height={14} />
          <Skeleton width="36%" height={12} />
        </span>
        {props.dato && <Skeleton width={64} height={12} />}
      </li>
    ))}
  </ul>
);

/** Tarjeta con título y unas líneas, dentro de la rejilla que se le pase. */
export const EsqueletoTarjetas = (props: {
  cantidad?: number;
  rejilla: string;
  altoCabecera?: number;
  lineas?: number;
}) => (
  <Cargando className={props.rejilla}>
    {Array.from({ length: props.cantidad ?? 3 }, (_, i) => (
      <div key={i} className="hrl-esq__tarjeta">
        <Skeleton width="58%" height={22} />
        {props.altoCabecera && (
          <div style={{ height: props.altoCabecera - 22 }} />
        )}
        <EsqueletoLineas lineas={props.lineas ?? 2} />
      </div>
    ))}
  </Cargando>
);

/** Tabla: barra de herramientas, cabecera y filas. */
export const EsqueletoTabla = (props: {
  filas?: number;
  columnas?: number;
  sinBarra?: boolean;
}) => {
  const columnas = props.columnas ?? 4;
  const plantilla = {
    gridTemplateColumns: `2fr repeat(${columnas - 1}, 1fr)`,
  };
  return (
    <Cargando className="hrl-esq__tabla">
      {!props.sinBarra && (
        <div className="hrl-esq__tabla-barra">
          <Skeleton width={240} height={32} />
          <Skeleton width={120} height={32} />
        </div>
      )}
      <div className="hrl-esq__tabla-cabecera" style={plantilla}>
        {Array.from({ length: columnas }, (_, c) => (
          <Skeleton key={c} width="50%" height={12} />
        ))}
      </div>
      {Array.from({ length: props.filas ?? 6 }, (_, f) => (
        <div key={f} className="hrl-esq__tabla-fila" style={plantilla}>
          {Array.from({ length: columnas }, (_celda, c) => (
            <Skeleton
              key={c}
              width={c === 0 ? ANCHOS[f % 6] : '60%'}
              height={14}
            />
          ))}
        </div>
      ))}
    </Cargando>
  );
};

/** Resumen del proyecto: barra de avance y los dos cuadros. */
export const EsqueletoAvance = () => (
  <Cargando className="hrl-seccion">
    <Skeleton width="100%" height={12} />
    <Skeleton width="40%" height={12} />
    <div className="hrl-esq__columnas">
      {[0, 1].map(i => (
        <div key={i} className="hrl-esq__tarjeta">
          <Skeleton width="38%" height={18} />
          <EsqueletoLista filas={4} />
        </div>
      ))}
    </div>
  </Cargando>
);

/**
 * Ficha de un proyecto o de una entidad: franja de identidad, pestañas y,
 * salvo que se pida solo la cabecera, el primer bloque.
 */
export const EsqueletoSubportal = (props: { soloCabecera?: boolean }) => (
  <Cargando>
    <div className="hrl-esq__heroe">
      <Skeleton width={160} height={12} />
      <Skeleton width="42%" height={34} />
      <Skeleton width="64%" height={16} />
    </div>
    <div className="hrl-esq__pestanas">
      {[96, 132, 168, 120, 104].map((ancho, i) => (
        <Skeleton key={i} width={ancho} height={16} />
      ))}
    </div>
    {!props.soloCabecera && (
      <div className="hrl-pagina">
        <EsqueletoAvance />
      </div>
    )}
  </Cargando>
);

/** Comprobaciones de calidad: el puntaje y la lista de reglas. */
export const EsqueletoReglas = (props: { reglas?: number }) => (
  <Cargando className="hrl-esq__tarjeta">
    <Skeleton width={140} height={12} />
    <Skeleton width={96} height={28} />
    <EsqueletoLista filas={props.reglas ?? 5} redondo />
  </Cargando>
);

/** Miembros: grupos con sus personas. */
export const EsqueletoMiembros = () => (
  <Cargando className="hrl-seccion">
    <Skeleton width="45%" height={14} />
    {[3, 2].map((personas, g) => (
      <div key={g} className="hrl-seccion">
        <Skeleton width={160} height={18} />
        <ul className="hrl-esq__personas">
          {Array.from({ length: personas }, (_, i) => (
            <li key={i}>
              <Skeleton width={40} height={40} rounded />
              <span className="hrl-esq__fila-texto">
                <Skeleton width={120} height={14} />
                <Skeleton width={80} height={12} />
              </span>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </Cargando>
);

/** Catálogo visual: navegación de historias a la izquierda, vista a la derecha. */
export const EsqueletoCatalogoVisual = () => (
  <Cargando className="hrl-esq__catalogo">
    <div className="hrl-esq__catalogo-nav">
      <Skeleton width="100%" height={32} />
      {Array.from({ length: 9 }, (_, i) => (
        <Skeleton key={i} width={ANCHOS[i % 6]} height={14} />
      ))}
    </div>
    <div className="hrl-esq__tarjeta">
      <Skeleton width="30%" height={20} />
      <Skeleton width="100%" height={440} />
    </div>
  </Cargando>
);

/** Círculo que gira: para esperas sin forma propia. */
export const Girador = (props: { tamano?: 'pequeno' | 'mediano' }) => (
  <span
    className={`hrl-girador hrl-girador--${props.tamano ?? 'mediano'}`}
    aria-hidden
  />
);

/**
 * Iframe con un girador encima hasta que termina de pintar: el sitio de
 * dentro (Ladle, draw.io) tarda y, sin aviso, el marco parece roto.
 */
export const MarcoConCarga = (
  props: IframeHTMLAttributes<HTMLIFrameElement> & { title: string },
) => {
  const { t } = useTranslationRef(textosHrl);
  const [cargado, setCargado] = useState(false);
  const { onLoad, ...resto } = props;
  return (
    <div className="hrl-marco-carga">
      {!cargado && (
        <div className="hrl-marco-carga__aviso" role="status">
          <Girador />
          <span>{t('carga.cargandoVista')}</span>
        </div>
      )}
      <iframe
        {...resto}
        title={props.title}
        onLoad={e => {
          setCargado(true);
          onLoad?.(e);
        }}
      />
    </div>
  );
};
