import {
  discoveryApiRef,
  fetchApiRef,
  useApi,
} from '@backstage/frontend-plugin-api';
import { useCarga } from '../comun/useCarga';

/**
 * Lo que el backend `proyectos` (packages/backend/src/plugins/proyectos.ts)
 * lee de GitHub para cada proyecto. Los tipos repiten los del backend.
 */

export type Miembro = {
  login: string;
  avatar: string;
  url: string;
  permiso: string | null;
  contribuciones: number;
};

export type Ejecucion = {
  flujo: string;
  estado: string;
  conclusion: string | null;
  fecha: string;
  rama: string;
  url: string;
};

export type Cambio = {
  titulo: string;
  fecha: string;
  url: string;
  autor: string;
};

export type Repositorio = {
  slug: string;
  url: string;
  descripcion: string | null;
  wiki: string | null;
  ramaPrincipal: string;
  miembros: Miembro[];
  miembrosSegun: 'colaboradores' | 'contribuidores';
  pruebas: { configuradas: boolean; ejecuciones: Ejecucion[] };
  cambios: Cambio[];
  error?: string;
};

export type Entrega = {
  id: string;
  fase: string;
  texto: string;
  estado: 'completada' | 'pendiente' | 'retirada';
  detalle: string;
};

export type Avance = {
  fuente: string;
  fases: { titulo: string; estado: string; fecha: string | null }[];
  entregas: Entrega[];
};

const useBackend = <T>(ruta: string) => {
  const discovery = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);
  return useCarga<T>(async () => {
    const base = await discovery.getBaseUrl('proyectos');
    const respuesta = await fetchApi.fetch(`${base}${ruta}`);
    if (!respuesta.ok) {
      throw new Error(
        `El portal respondió ${respuesta.status} ${respuesta.statusText}`,
      );
    }
    return (await respuesta.json()) as T;
  }, [discovery, fetchApi, ruta]);
};

export const useRepositorios = (sistema: string) =>
  useBackend<{ repositorios: Repositorio[] }>(
    `/${encodeURIComponent(sistema)}/repositorios`,
  );

export const useAvance = (sistema: string) =>
  useBackend<{ avance: Avance | null; error?: string; fuente?: string }>(
    `/${encodeURIComponent(sistema)}/avance`,
  );

/** La última ejecución terminada de cada flujo de pruebas. */
export const ultimasPorFlujo = (ejecuciones: Ejecucion[]) => {
  const vistos = new Map<string, Ejecucion>();
  for (const e of ejecuciones) if (!vistos.has(e.flujo)) vistos.set(e.flujo, e);
  return [...vistos.values()];
};

/** Fecha corta en el idioma del navegador. */
export const fechaCorta = (iso: string) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';
