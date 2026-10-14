import { useCarga } from '../comun/useCarga';

/**
 * Ficha técnica de un proyecto: tecnologías con versión, diagramas,
 * despliegue, procesos y documentos. Vive en
 * `packages/app/public/fichas/<sistema>/ficha.json`, junto a sus diagramas
 * (HTML generados con archify desde `catalog/proyectos/<sistema>/diagramas/`).
 *
 * Un `null` significa «falta este dato»: el portal lo muestra como pendiente,
 * con lo que hay que completar, en lugar de inventarlo o esconderlo.
 */

export type CapaFicha =
  | 'frontend'
  | 'backend'
  | 'base-de-datos'
  | 'microservicios'
  | 'infraestructura';

export const CAPAS_FICHA: CapaFicha[] = [
  'frontend',
  'backend',
  'base-de-datos',
  'microservicios',
  'infraestructura',
];

export type Diagrama = { archivo: string; ancho: number; alto: number };

export type Ficha = {
  version: 1;
  proyecto: string;
  actualizado: string;
  fuentes: string[];
  tecnologias: {
    capa: CapaFicha;
    nombre: string;
    version: string | null;
    uso: string;
  }[];
  arquitectura?: { diagrama: Diagrama; puntos: string[] };
  despliegue?: {
    diagrama: Diagrama;
    comandos: string[];
    entornos: {
      nombre: string;
      descripcion: string;
      url: string | null;
      pendiente?: string;
    }[];
    expuesto: string[];
    interno: string[];
    variables: { nombre: string; uso: string }[];
    guia?: { titulo: string; componente: string; pagina: string };
    respaldos: string | null;
    acceso: string | null;
  };
  procesos?: {
    titulo: string;
    descripcion: string;
    diagrama: Diagrama;
    pendientes: string[];
  }[];
  documentos?: {
    drive: string | null;
    lista: {
      titulo: string;
      descripcion: string;
      tipo: string;
      archivo: string;
      url: string | null;
    }[];
  };
};

/** Carpeta pública de las fichas, servida junto a la app. */
export const rutaFicha = (sistema: string, archivo = 'ficha.json') =>
  `/fichas/${encodeURIComponent(sistema)}/${archivo}`;

/**
 * Carga la ficha de un proyecto. Sin ficha devuelve `undefined`: el servidor
 * de desarrollo responde con el index.html de la app a una ruta que no existe,
 * así que no basta con mirar el código HTTP.
 */
export const useFicha = (sistema: string) =>
  useCarga<Ficha | undefined>(async () => {
    const respuesta = await fetch(rutaFicha(sistema), {
      headers: { Accept: 'application/json' },
    });
    if (!respuesta.ok) return undefined;
    const tipo = respuesta.headers.get('content-type') ?? '';
    if (!tipo.includes('json')) return undefined;
    return (await respuesta.json()) as Ficha;
  }, [sistema]);
