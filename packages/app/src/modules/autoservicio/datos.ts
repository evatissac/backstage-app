import { useApi } from '@backstage/frontend-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { Entidad, refDe, relaciones } from '../comun/entidades';
import { useCarga } from '../comun/useCarga';

/**
 * Anotaciones con las que una plantilla se presenta en Autoservicio:
 *
 * - `hrl/verbo`: el texto del botón («Crear repositorio»). Sin ella, «Empezar».
 * - `hrl/aplica-a`: clases de entidad (separadas por comas) en cuya ficha la
 *   plantilla aparece como acción ⚡, p. ej. `system`.
 * - `hrl/prellenar`: qué campos del formulario llegan ya completos desde esa
 *   ficha, como `campo=fuente` separados por comas. Fuentes: `entidad` (la
 *   propia ficha), `sistema` (su proyecto) y `responsable` (su equipo).
 */
export const ANOTACION_VERBO = 'hrl/verbo';
export const ANOTACION_APLICA = 'hrl/aplica-a';
export const ANOTACION_PRELLENAR = 'hrl/prellenar';

export type Plantilla = Entidad;

export const usePlantillas = () => {
  const catalogo = useApi(catalogApiRef);
  return useCarga<Plantilla[]>(
    async () =>
      (
        await catalogo.getEntities({
          filter: { kind: 'Template' },
          order: { field: 'metadata.title', order: 'asc' },
        })
      ).items,
    [catalogo],
  );
};

export const tipoPlantilla = (p: Plantilla) =>
  ((p.spec ?? {}) as { type?: string }).type ?? 'otros';

const aplicaA = (p: Plantilla) =>
  (p.metadata.annotations?.[ANOTACION_APLICA] ?? '')
    .split(',')
    .map(k => k.trim().toLowerCase())
    .filter(Boolean);

/** Plantillas que se ofrecen como acción en la ficha de esta entidad. */
export const accionesPara = (plantillas: Plantilla[], entidad: Entidad) =>
  plantillas.filter(p => aplicaA(p).includes(entidad.kind.toLowerCase()));

/** Valores con los que la ficha de `entidad` prellena el formulario. */
export const prellenado = (p: Plantilla, entidad: Entidad) => {
  const fuentes: Record<string, string | undefined> = {
    entidad: refDe(entidad),
    sistema:
      entidad.kind.toLowerCase() === 'system'
        ? refDe(entidad)
        : relaciones(entidad, 'partOf').find(r => r.startsWith('system:')),
    responsable: relaciones(entidad, 'ownedBy')[0],
  };
  const datos: Record<string, string> = {};
  for (const par of (p.metadata.annotations?.[ANOTACION_PRELLENAR] ?? '').split(
    ',',
  )) {
    const [campo, fuente] = par.split('=').map(x => x.trim());
    const valor = fuente ? fuentes[fuente] : undefined;
    if (campo && valor) datos[campo] = valor;
  }
  return datos;
};

/** Ruta al formulario de la plantilla, con datos ya completos si los hay. */
export const rutaPlantilla = (
  p: Plantilla,
  datos: Record<string, string> = {},
) => {
  const base = `/create/templates/${p.metadata.namespace ?? 'default'}/${
    p.metadata.name
  }`;
  return Object.keys(datos).length > 0
    ? `${base}?formData=${encodeURIComponent(JSON.stringify(datos))}`
    : base;
};
