import { Entidad } from '../comun/entidades';

/**
 * Comprobaciones de calidad, al estilo de Soundcheck de Spotify o de los
 * scorecards de Port. Las evalúa el backend con Tech Insights
 * (packages/backend/src/modules/calidad.ts y techInsights en app-config.yaml):
 * aquí solo se declara a qué nivel pertenece cada una, y su texto está en
 * modules/idioma. El id debe ser el mismo en los tres sitios.
 *
 * Cada nivel exige los anteriores: no se llega a Plata sin cumplir Bronce.
 */

export type Nivel = 'bronce' | 'plata' | 'oro';
export const NIVELES: Nivel[] = ['bronce', 'plata', 'oro'];

export type Regla = { id: string; nivel: Nivel };

export const REGLAS: Regla[] = [
  // Bronce: se sabe qué es y quién responde por él.
  { id: 'responsable', nivel: 'bronce' },
  { id: 'proyecto', nivel: 'bronce' },
  { id: 'descripcion', nivel: 'bronce' },
  // Plata: alguien nuevo puede trabajar con él sin preguntar.
  { id: 'documentacion', nivel: 'plata' },
  { id: 'repositorio', nivel: 'plata' },
  { id: 'cicloDeVida', nivel: 'plata' },
  { id: 'readme', nivel: 'plata' },
  { id: 'sinCredenciales', nivel: 'plata' },
  // Oro: listo para producción y con un equipo real detrás.
  { id: 'etiquetas', nivel: 'oro' },
  { id: 'equipo', nivel: 'oro' },
  { id: 'produccion', nivel: 'oro' },
  { id: 'codeowners', nivel: 'oro' },
  { id: 'kitFijado', nivel: 'oro' },
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
  /** El nivel más alto con todas sus reglas (y las de los anteriores) cumplidas. */
  nivel?: Nivel;
  cumplidas: number;
  total: number;
  /** Ninguna regla tiene resultado todavía. */
  sinEvaluar: boolean;
};

export const resultado = (
  entidad: Entidad,
  reglas: Record<string, EstadoRegla>,
): Resultado => {
  let nivel: Nivel | undefined;
  for (const n of NIVELES) {
    if (REGLAS.filter(r => r.nivel === n).every(r => reglas[r.id] === true)) {
      nivel = n;
    } else break;
  }
  return {
    entidad,
    reglas,
    nivel,
    cumplidas: REGLAS.filter(r => reglas[r.id] === true).length,
    total: REGLAS.length,
    sinEvaluar: REGLAS.every(r => reglas[r.id] === undefined),
  };
};

/** Lo siguiente que falta para subir de nivel (incluye lo no evaluado). */
export const pendientes = (r: Resultado) => {
  const siguiente = r.nivel
    ? NIVELES[NIVELES.indexOf(r.nivel) + 1]
    : NIVELES[0];
  return siguiente
    ? REGLAS.filter(
        regla => regla.nivel === siguiente && r.reglas[regla.id] !== true,
      )
    : [];
};
