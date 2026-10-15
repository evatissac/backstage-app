import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { UrlReaderService } from '@backstage/backend-plugin-api';

/**
 * Catálogo visual (Ladle) de un proyecto, servido por el propio portal.
 *
 * El kit de UI usa React 19 y el portal React 18: sus componentes no se pueden
 * pintar dentro de Backstage. En su lugar, el kit publica su Ladle compilado
 * en la rama `catalogo` de su repositorio, el portal lo descarga y lo sirve
 * en `/api/proyectos/ladle/<sistema>/`, y la pestaña «Catálogo visual» lo
 * muestra en un iframe. El sitio debe compilarse con `ladle build --base ./`:
 * con rutas absolutas no funciona bajo una subruta.
 */

/** Anotación del System con la URL del árbol que contiene el sitio compilado. */
export const ANOTACION_LADLE = 'hrl/ladle';

const MINUTOS = 10;

const TIPOS: Record<string, string> = {
  html: 'text/html; charset=utf-8',
  js: 'text/javascript; charset=utf-8',
  mjs: 'text/javascript; charset=utf-8',
  css: 'text/css; charset=utf-8',
  json: 'application/json; charset=utf-8',
  webmanifest: 'application/manifest+json',
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  ico: 'image/x-icon',
  woff: 'font/woff',
  woff2: 'font/woff2',
  ttf: 'font/ttf',
  txt: 'text/plain; charset=utf-8',
};

export const tipoDe = (ruta: string) =>
  TIPOS[ruta.split('.').pop()?.toLowerCase() ?? ''] ??
  'application/octet-stream';

type Sitio = {
  archivos: Map<string, Buffer>;
  etag?: string;
  leidoEn: number;
};

/** Lee y guarda en memoria los sitios de Ladle (unos pocos MB cada uno). */
export const crearAlmacenLadle = (urlReader: UrlReaderService) => {
  const sitios = new Map<string, Sitio>();

  const desdeCarpeta = async (carpeta: string) => {
    const archivos = new Map<string, Buffer>();
    const rutas = await readdir(carpeta, {
      recursive: true,
      withFileTypes: true,
    });
    for (const e of rutas) {
      if (!e.isFile()) continue;
      const completa = join(e.parentPath, e.name);
      const relativa = completa
        .slice(carpeta.length)
        .replace(/\\/g, '/')
        .replace(/^\/+/, '');
      archivos.set(relativa, await readFile(completa));
    }
    return archivos;
  };

  const desdeUrl = async (url: string, anterior?: Sitio) => {
    try {
      const arbol = await urlReader.readTree(url, { etag: anterior?.etag });
      const archivos = new Map<string, Buffer>();
      for (const a of await arbol.files()) {
        archivos.set(a.path, await a.content());
      }
      return { archivos, etag: arbol.etag };
    } catch (e) {
      // Sin cambios desde la última lectura: se conserva lo que había.
      if (anterior && (e as Error).name === 'NotModifiedError') {
        return { archivos: anterior.archivos, etag: anterior.etag };
      }
      throw e;
    }
  };

  /**
   * Sitio de un proyecto. `carpetaLocal` (solo para desarrollo, desde
   * app-config.local.yaml) tiene prioridad sobre la URL del catálogo.
   */
  return async (
    sistema: string,
    origen: { url?: string; carpetaLocal?: string },
  ) => {
    const anterior = sitios.get(sistema);
    if (anterior && Date.now() - anterior.leidoEn < MINUTOS * 60_000) {
      return anterior;
    }
    let sitio: Sitio;
    if (origen.carpetaLocal) {
      sitio = {
        archivos: await desdeCarpeta(origen.carpetaLocal),
        leidoEn: Date.now(),
      };
    } else if (origen.url) {
      sitio = {
        ...(await desdeUrl(origen.url, anterior)),
        leidoEn: Date.now(),
      };
    } else {
      return undefined;
    }
    sitios.set(sistema, sitio);
    return sitio;
  };
};

/**
 * Cabeceras para que el portal (y solo él) pueda mostrar el sitio en un
 * iframe, y para que el sitio no cargue nada de fuera.
 */
export const cabecerasLadle = (origenApp: string) => ({
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    `frame-ancestors 'self' ${origenApp}`,
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'same-origin',
});
