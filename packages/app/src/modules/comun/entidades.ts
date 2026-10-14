import { catalogApiRef } from '@backstage/plugin-catalog-react';

// El tipo Entity vive en @backstage/catalog-model, que la app no declara como
// dependencia; se deriva de la API del catálogo para no añadir una.
type ApiCatalogo = typeof catalogApiRef.T;
export type Entidad = Awaited<
  ReturnType<ApiCatalogo['getEntities']>
>['items'][number];

export const ANOTACION_COLOR = 'hrl/color';
export const ANOTACION_TECHDOCS = 'backstage.io/techdocs-ref';
// Apunta a la documentación de otra entidad (p. ej. varios componentes de un
// mismo repo que comparten docs).
export const ANOTACION_TECHDOCS_ENTIDAD = 'backstage.io/techdocs-entity';

/** `kind:namespace/name` en minúsculas, como lo escribe el catálogo. */
export const refDe = (e: Entidad) =>
  `${e.kind}:${e.metadata.namespace ?? 'default'}/${
    e.metadata.name
  }`.toLowerCase();

/** Separa una referencia `kind:namespace/name` (namespace opcional). */
export const partesRef = (ref: string) => {
  const [kind, resto] = ref.includes(':') ? ref.split(':', 2) : ['', ref];
  const [namespace, name] = resto.includes('/')
    ? resto.split('/', 2)
    : ['default', resto];
  return { kind, namespace, name };
};

export const tituloDe = (e: Entidad) => e.metadata.title ?? e.metadata.name;

export const rutaEntidad = (e: Entidad) =>
  `/catalog/${e.metadata.namespace ?? 'default'}/${e.kind.toLowerCase()}/${
    e.metadata.name
  }`;

export const rutaDocs = (e: Entidad) => {
  const otra = e.metadata.annotations?.[ANOTACION_TECHDOCS_ENTIDAD];
  if (otra) {
    const { kind, namespace, name } = partesRef(otra);
    return `/docs/${namespace}/${(kind || e.kind).toLowerCase()}/${name}`;
  }
  return `/docs/${e.metadata.namespace ?? 'default'}/${e.kind.toLowerCase()}/${
    e.metadata.name
  }`;
};

export const rutaProyecto = (sistema: Entidad | string) =>
  `/proyectos/${typeof sistema === 'string' ? sistema : sistema.metadata.name}`;

/** Destinos de una relación, por ejemplo los `ownedBy` de una entidad. */
export const relaciones = (e: Entidad, tipo: string) =>
  (e.relations ?? []).filter(r => r.type === tipo).map(r => r.targetRef);

export const tieneDocs = (e: Entidad) =>
  Boolean(
    e.metadata.annotations?.[ANOTACION_TECHDOCS] ||
      e.metadata.annotations?.[ANOTACION_TECHDOCS_ENTIDAD],
  );

// Colores de proyecto cuando el sistema no declara `hrl/color`. Se elige por
// el nombre, así un proyecto conserva su color entre visitas.
const coloresProyecto = [
  '#0e7f78',
  '#0e7490',
  '#7c3aed',
  '#c2410c',
  '#be185d',
  '#4d7c0f',
];

export const colorProyecto = (sistema: Entidad) => {
  const declarado = sistema.metadata.annotations?.[ANOTACION_COLOR];
  if (declarado && /^#[0-9a-f]{6}$/i.test(declarado)) return declarado;
  let h = 0;
  for (const c of sistema.metadata.name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return coloresProyecto[h % coloresProyecto.length];
};

/** «Sistema de Reporte Estadístico» → «Reporte Estadístico», para espacios estrechos. */
export const nombreCorto = (texto: string) =>
  texto.replace(/^Sistema de /i, '');

/** Iniciales para el monograma de un proyecto: «Vigilancia Oncológica» → «VO». */
export const iniciales = (texto: string) =>
  texto
    .replace(/^(Sistema|Plataforma) de /i, '')
    .split(/\s+/)
    .filter(p => p.length > 2 || /^[A-Z]{2,}$/.test(p))
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('') || texto.slice(0, 2).toUpperCase();
