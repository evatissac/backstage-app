import { useApi } from '@backstage/frontend-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { Entidad, refDe, relaciones } from '../comun/entidades';
import { useCarga } from '../comun/useCarga';
import { Contexto, evaluar, Resultado } from './reglas';

/** Grupos con al menos un miembro: la regla «equipo» los necesita. */
const cargarContexto = async (
  catalogo: typeof catalogApiRef.T,
): Promise<Contexto> => {
  const grupos = await catalogo.getEntities({
    filter: { kind: 'Group' },
    fields: ['kind', 'metadata.name', 'metadata.namespace', 'relations'],
  });
  return {
    gruposConMiembros: new Set(
      grupos.items
        .filter(g => relaciones(g, 'hasMember').length > 0)
        .map(refDe),
    ),
  };
};

/**
 * Evalúa los componentes y APIs del catálogo; con `sistema`, solo los de ese
 * proyecto.
 */
export const useCalidad = (sistema?: string) => {
  const catalogo = useApi(catalogApiRef);
  return useCarga<Resultado[]>(async () => {
    const filtro: Record<string, string | string[]> = {
      kind: ['Component', 'API'],
    };
    if (sistema) {
      filtro['relations.partOf'] = `system:default/${sistema}`.toLowerCase();
    }
    const [entidades, ctx, sistemas] = await Promise.all([
      catalogo.getEntities({
        filter: filtro,
        order: { field: 'metadata.name', order: 'asc' },
      }),
      cargarContexto(catalogo),
      catalogo.getEntities({
        filter: { kind: 'System' },
        fields: ['kind', 'metadata.name', 'metadata.namespace'],
      }),
    ]);
    // Solo lo que pertenece a un proyecto publicado (catalog/hrl.yaml).
    const publicados = new Set(sistemas.items.map(refDe));
    return entidades.items
      .filter(e =>
        relaciones(e, 'partOf').some(r => publicados.has(r.toLowerCase())),
      )
      .map(e => evaluar(e, ctx));
  }, [catalogo, sistema]);
};

/** Una sola entidad (la pestaña «Calidad» de su ficha). */
export const useCalidadEntidad = (entidad: Entidad) => {
  const catalogo = useApi(catalogApiRef);
  return useCarga<Resultado>(
    async () => evaluar(entidad, await cargarContexto(catalogo)),
    [catalogo, refDe(entidad)],
  );
};
