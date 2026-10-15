import { Entidad } from '../comun/entidades';

/**
 * Comprobaciones de calidad. Las evalúa el backend con Tech Insights
 * (packages/backend/src/modules/calidad.ts y techInsights en app-config.yaml);
 * aquí solo se declara en qué categoría se muestra cada una, y su texto está
 * en modules/idioma. El id debe ser el mismo en los tres sitios.
 *
 * No hay niveles: un componente se describe por cuántas comprobaciones
 * cumple («9 de 12») y cuáles le faltan.
 */

export type Categoria =
  | 'identificacion'
  | 'documentacion'
  | 'repositorio'
  | 'operacion';

export const CATEGORIAS: Categoria[] = [
  'identificacion',
  'documentacion',
  'repositorio',
  'operacion',
];

export type Regla = { id: string; categoria: Categoria };

export const REGLAS: Regla[] = [
  { id: 'proyecto', categoria: 'identificacion' },
  { id: 'descripcion', categoria: 'identificacion' },
  { id: 'cicloDeVida', categoria: 'identificacion' },
  { id: 'etiquetas', categoria: 'identificacion' },
  { id: 'documentacion', categoria: 'documentacion' },
  { id: 'readme', categoria: 'documentacion' },
  { id: 'repositorio', categoria: 'repositorio' },
  { id: 'codeowners', categoria: 'repositorio' },
  { id: 'sinCredenciales', categoria: 'repositorio' },
  { id: 'kitFijado', categoria: 'repositorio' },
  { id: 'pruebas', categoria: 'operacion' },
  { id: 'produccion', categoria: 'operacion' },
];

/**
 * `true` cumple, `false` no cumple y `undefined` aún no se evaluó (el
 * backend todavía no recogió sus datos o no pudo leer el repositorio). Lo
 * no evaluado no se da por cumplido ni por fallido.
 */
export type EstadoRegla = boolean | undefined;

export type Resultado = {
  entidad: Entidad;
  reglas: Record<string, EstadoRegla>;
  cumplidas: number;
  /** Comprobaciones con resultado: el denominador honesto del puntaje. */
  evaluadas: number;
  total: number;
  /** Ninguna regla tiene resultado todavía. */
  sinEvaluar: boolean;
};

export const resultado = (
  entidad: Entidad,
  reglas: Record<string, EstadoRegla>,
): Resultado => {
  const evaluadas = REGLAS.filter(r => reglas[r.id] !== undefined).length;
  return {
    entidad,
    reglas,
    cumplidas: REGLAS.filter(r => reglas[r.id] === true).length,
    evaluadas,
    total: REGLAS.length,
    sinEvaluar: evaluadas === 0,
  };
};

/** Lo que le falta: no cumple o aún sin evaluar. */
export const pendientes = (r: Resultado) =>
  REGLAS.filter(regla => r.reglas[regla.id] !== true);

/** Parte cumplida de lo evaluado, o null si no hay nada evaluado. */
export const proporcion = (r: Resultado) =>
  r.evaluadas === 0 ? null : r.cumplidas / r.evaluadas;
