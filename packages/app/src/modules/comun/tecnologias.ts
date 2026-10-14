/**
 * Clasifica las etiquetas del catálogo (metadata.tags) por capa. Las
 * etiquetas son libres; lo que no está aquí cae en «otras» y se muestra igual.
 * Para sumar una tecnología basta con agregarla a su capa.
 */
export type Capa =
  | 'frontend'
  | 'backend'
  | 'datos'
  | 'infraestructura'
  | 'otras';

export const CAPAS: Capa[] = [
  'frontend',
  'backend',
  'datos',
  'infraestructura',
  'otras',
];

const POR_CAPA: Record<Exclude<Capa, 'otras'>, string[]> = {
  frontend: [
    'react',
    'vite',
    'vue',
    'angular',
    'svelte',
    'typescript',
    'javascript',
    'html',
    'css',
    'hrl-core-ui',
  ],
  backend: [
    'python',
    'fastapi',
    'django',
    'flask',
    'node',
    'express',
    'java',
    'spring',
    'php',
    'laravel',
    'dotnet',
  ],
  datos: [
    'postgresql',
    'mysql',
    'mariadb',
    'sqlserver',
    'oracle',
    'mongodb',
    'redis',
    'sqlite',
    'excel',
  ],
  infraestructura: [
    'docker',
    'nginx',
    'coolify',
    'kubernetes',
    'github-actions',
  ],
};

export const capaDe = (etiqueta: string): Capa => {
  const t = etiqueta.toLowerCase();
  for (const capa of Object.keys(POR_CAPA) as Exclude<Capa, 'otras'>[]) {
    if (POR_CAPA[capa].includes(t)) return capa;
  }
  return 'otras';
};

/** Etiquetas sin repetir, ordenadas por capa (frontend primero). */
export const ordenarPorCapa = (etiquetas: string[]) =>
  [...new Set(etiquetas.map(e => e.toLowerCase()))].sort(
    (a, b) =>
      CAPAS.indexOf(capaDe(a)) - CAPAS.indexOf(capaDe(b)) || a.localeCompare(b),
  );

/** Agrupa las etiquetas por capa; las capas vacías no aparecen. */
export const agruparPorCapa = (etiquetas: string[]) => {
  const grupos = new Map<Capa, string[]>();
  for (const e of ordenarPorCapa(etiquetas)) {
    const capa = capaDe(e);
    grupos.set(capa, [...(grupos.get(capa) ?? []), e]);
  }
  return grupos;
};
