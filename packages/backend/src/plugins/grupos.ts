import { InputError } from '@backstage/errors';

/**
 * Grupos de personas de cada proyecto (p. ej. «Desarrollo», «Estadística»).
 * Se editan desde la pestaña Miembros del portal y se guardan en la base del
 * plugin `proyectos`, una fila por proyecto.
 */

export type Grupo = { nombre: string; miembros: string[] };

export type GruposProyecto = {
  grupos: Grupo[];
  actualizadoPor: string | null;
  actualizadoEn: string | null;
};

export const TABLA = 'proyecto_grupos';

const MAX_GRUPOS = 20;
const MAX_MIEMBROS = 100;
// Usuario de GitHub: letras, números y guiones, hasta 39 caracteres.
const LOGIN = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;

/** Valida y normaliza lo que llega del navegador; lanza InputError si no sirve. */
export const validarGrupos = (cuerpo: unknown): Grupo[] => {
  const grupos = (cuerpo as { grupos?: unknown })?.grupos;
  if (!Array.isArray(grupos)) {
    throw new InputError('Se esperaba { grupos: [...] }');
  }
  if (grupos.length > MAX_GRUPOS) {
    throw new InputError(`Como máximo ${MAX_GRUPOS} grupos por proyecto`);
  }
  const vistos = new Set<string>();
  return grupos.map((g, i) => {
    const nombre =
      typeof g?.nombre === 'string' ? g.nombre.trim().replace(/\s+/g, ' ') : '';
    if (!nombre || nombre.length > 60) {
      throw new InputError(
        `El grupo ${i + 1} necesita un nombre de 1 a 60 caracteres`,
      );
    }
    if (vistos.has(nombre.toLowerCase())) {
      throw new InputError(`Hay dos grupos llamados «${nombre}»`);
    }
    vistos.add(nombre.toLowerCase());
    const miembros = Array.isArray(g?.miembros) ? g.miembros : [];
    if (miembros.length > MAX_MIEMBROS) {
      throw new InputError(`«${nombre}» tiene más de ${MAX_MIEMBROS} personas`);
    }
    for (const m of miembros) {
      if (typeof m !== 'string' || !LOGIN.test(m)) {
        throw new InputError(
          `«${String(m)}» no es un usuario de GitHub válido`,
        );
      }
    }
    return { nombre, miembros: [...new Set(miembros as string[])] };
  });
};

type Knex = {
  schema: {
    hasTable(t: string): Promise<boolean>;
    createTable(t: string, f: (tabla: any) => void): Promise<void>;
  };
  (t: string): any;
};

export const prepararTabla = async (db: Knex) => {
  if (await db.schema.hasTable(TABLA)) return;
  await db.schema.createTable(TABLA, tabla => {
    tabla.string('sistema').primary();
    tabla.text('grupos').notNullable();
    tabla.string('actualizado_por');
    tabla.timestamp('actualizado_en');
  });
};

export const leerGrupos = async (
  db: Knex,
  sistema: string,
): Promise<GruposProyecto> => {
  const fila = await db(TABLA).where({ sistema }).first();
  if (!fila) return { grupos: [], actualizadoPor: null, actualizadoEn: null };
  return {
    grupos: JSON.parse(fila.grupos),
    actualizadoPor: fila.actualizado_por ?? null,
    actualizadoEn: fila.actualizado_en
      ? new Date(fila.actualizado_en).toISOString()
      : null,
  };
};

export const guardarGrupos = async (
  db: Knex,
  sistema: string,
  grupos: Grupo[],
  usuario: string,
) => {
  await db(TABLA)
    .insert({
      sistema,
      grupos: JSON.stringify(grupos),
      actualizado_por: usuario,
      actualizado_en: new Date(),
    })
    .onConflict('sistema')
    .merge();
};
