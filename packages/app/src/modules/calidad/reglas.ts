import { Entidad, relaciones, tieneDocs } from '../comun/entidades';

/**
 * Comprobaciones de calidad, al estilo de Soundcheck de Spotify, calculadas
 * solo con lo que el catálogo ya sabe de cada entidad. No leen el contenido
 * del repositorio: para eso haría falta un backend (Tech Insights).
 *
 * Cada nivel exige los anteriores: no se llega a Plata sin cumplir Bronce.
 */

export type Nivel = 'bronce' | 'plata' | 'oro';
export const NIVELES: Nivel[] = ['bronce', 'plata', 'oro'];

/** Datos que no están en la entidad y hay que buscar aparte. */
export type Contexto = {
  /** Grupos (ref en minúsculas) con al menos un miembro. */
  gruposConMiembros: Set<string>;
};

export type Regla = {
  id: string;
  nivel: Nivel;
  cumple: (e: Entidad, ctx: Contexto) => boolean;
};

const spec = (e: Entidad) =>
  (e.spec ?? {}) as { owner?: string; system?: string; lifecycle?: string };

const anotacion = (e: Entidad, clave: string) =>
  Boolean(e.metadata.annotations?.[clave]);

export const REGLAS: Regla[] = [
  // Bronce: se sabe qué es y quién responde por él.
  {
    id: 'responsable',
    nivel: 'bronce',
    cumple: e => relaciones(e, 'ownedBy').length > 0,
  },
  {
    id: 'proyecto',
    nivel: 'bronce',
    cumple: e =>
      Boolean(spec(e).system) ||
      relaciones(e, 'partOf').some(r => r.startsWith('system:')),
  },
  {
    id: 'descripcion',
    nivel: 'bronce',
    cumple: e => (e.metadata.description ?? '').trim().length >= 10,
  },
  // Plata: alguien nuevo puede trabajar con él sin preguntar.
  { id: 'documentacion', nivel: 'plata', cumple: e => tieneDocs(e) },
  {
    id: 'repositorio',
    nivel: 'plata',
    cumple: e =>
      anotacion(e, 'backstage.io/source-location') ||
      anotacion(e, 'github.com/project-slug'),
  },
  {
    id: 'cicloDeVida',
    nivel: 'plata',
    cumple: e => Boolean(spec(e).lifecycle),
  },
  // Oro: listo para producción y con un equipo real detrás.
  {
    id: 'etiquetas',
    nivel: 'oro',
    cumple: e => (e.metadata.tags ?? []).length > 0,
  },
  {
    id: 'equipo',
    nivel: 'oro',
    cumple: (e, ctx) =>
      relaciones(e, 'ownedBy').some(r =>
        ctx.gruposConMiembros.has(r.toLowerCase()),
      ),
  },
  {
    id: 'produccion',
    nivel: 'oro',
    cumple: e => spec(e).lifecycle === 'production',
  },
];

export type Resultado = {
  entidad: Entidad;
  /** id de regla → cumple. */
  reglas: Record<string, boolean>;
  /** El nivel más alto con todas sus reglas (y las de los anteriores) cumplidas. */
  nivel?: Nivel;
  cumplidas: number;
  total: number;
};

export const evaluar = (entidad: Entidad, ctx: Contexto): Resultado => {
  const reglas = Object.fromEntries(
    REGLAS.map(r => [r.id, r.cumple(entidad, ctx)]),
  );
  let nivel: Nivel | undefined;
  for (const n of NIVELES) {
    if (REGLAS.filter(r => r.nivel === n).every(r => reglas[r.id])) nivel = n;
    else break;
  }
  const cumplidas = Object.values(reglas).filter(Boolean).length;
  return { entidad, reglas, nivel, cumplidas, total: REGLAS.length };
};

/** Lo siguiente que falta para subir de nivel. */
export const pendientes = (r: Resultado) => {
  const siguiente = r.nivel
    ? NIVELES[NIVELES.indexOf(r.nivel) + 1]
    : NIVELES[0];
  return siguiente
    ? REGLAS.filter(regla => regla.nivel === siguiente && !r.reglas[regla.id])
    : [];
};
