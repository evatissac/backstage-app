import {
  discoveryApiRef,
  fetchApiRef,
  useApi,
} from '@backstage/frontend-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { Entidad, refDe, relaciones } from '../comun/entidades';
import { useCarga } from '../comun/useCarga';
import { EstadoRegla, REGLAS, Resultado, resultado } from './reglas';

type RespuestaEntidad = {
  entity: string;
  results: { check: { id: string }; result: boolean }[];
  error?: { message?: string };
};

/**
 * Pide a Tech Insights el resultado de todas las reglas para estas
 * entidades. Una regla sin datos no aparece en la respuesta: queda sin
 * evaluar.
 */
const evaluar = async (
  discovery: typeof discoveryApiRef.T,
  fetchApi: typeof fetchApiRef.T,
  entidades: Entidad[],
): Promise<Resultado[]> => {
  // Con la lista vacía el backend evaluaría todo lo que conoce.
  if (entidades.length === 0) return [];
  const base = await discovery.getBaseUrl('tech-insights');
  const respuesta = await fetchApi.fetch(`${base}/checks/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      checks: REGLAS.map(r => r.id),
      entities: entidades.map(refDe),
    }),
  });
  if (!respuesta.ok) {
    throw new Error(
      `Tech Insights respondió ${respuesta.status} ${respuesta.statusText}`,
    );
  }
  const porEntidad = new Map(
    ((await respuesta.json()) as RespuestaEntidad[]).map(r => [
      r.entity.toLowerCase(),
      r,
    ]),
  );
  return entidades.map(e => {
    const reglas: Record<string, EstadoRegla> = {};
    for (const r of porEntidad.get(refDe(e))?.results ?? []) {
      reglas[r.check.id] = r.result;
    }
    return resultado(e, reglas);
  });
};

/**
 * Evalúa los componentes y APIs del catálogo; con `sistema`, solo los de ese
 * proyecto.
 */
export const useCalidad = (sistema?: string) => {
  const catalogo = useApi(catalogApiRef);
  const discovery = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);
  return useCarga<Resultado[]>(async () => {
    const filtro: Record<string, string | string[]> = {
      kind: ['Component', 'API'],
    };
    if (sistema) {
      filtro['relations.partOf'] = `system:default/${sistema}`.toLowerCase();
    }
    const [entidades, sistemas] = await Promise.all([
      catalogo.getEntities({
        filter: filtro,
        order: { field: 'metadata.name', order: 'asc' },
      }),
      catalogo.getEntities({
        filter: { kind: 'System' },
        fields: ['kind', 'metadata.name', 'metadata.namespace'],
      }),
    ]);
    // Solo lo que pertenece a un proyecto publicado (catalog/hrl.yaml).
    const publicados = new Set(sistemas.items.map(refDe));
    return evaluar(
      discovery,
      fetchApi,
      entidades.items.filter(e =>
        relaciones(e, 'partOf').some(r => publicados.has(r.toLowerCase())),
      ),
    );
  }, [catalogo, discovery, fetchApi, sistema]);
};

/** Una sola entidad (la pestaña «Calidad» de su ficha). */
export const useCalidadEntidad = (entidad: Entidad) => {
  const discovery = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);
  return useCarga<Resultado>(
    async () => (await evaluar(discovery, fetchApi, [entidad]))[0],
    [discovery, fetchApi, refDe(entidad)],
  );
};
