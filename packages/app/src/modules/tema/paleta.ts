// Paleta verde agua del portal. Es la única fuente de colores para el tema de
// Material UI (index.tsx); tokens.css repite estos mismos valores para los
// componentes de Backstage UI, porque una hoja CSS no puede importar un .ts.
// Si cambias un valor aquí, cámbialo también allí.

export const verdeAgua = {
  50: '#effcf9',
  100: '#c9f5ec',
  200: '#94eadb',
  300: '#5ed6c6',
  400: '#2fbcae',
  500: '#159f94',
  600: '#0e7f78',
  700: '#0f6661',
  800: '#11524f',
  900: '#123f3d',
  950: '#062624',
} as const;

// Superficies del modo oscuro, con un matiz verde muy leve para que no se
// sientan grises planos junto al acento.
export const nocturno = {
  app: '#0e1514',
  superficie1: '#151e1d',
  superficie2: '#1c2726',
  superficie3: '#24302f',
  borde: '#2b3a38',
  textoSecundario: '#9db3b0',
  textoTenue: '#6b807d',
} as const;

// Superficies del modo claro.
export const diurno = {
  app: '#f3f6f6',
  superficie1: '#ffffff',
  borde: '#e2e8e7',
  textoSecundario: '#5c6b69',
  textoTenue: '#93a3a1',
} as const;

// Barra lateral: oscura en ambos modos, como la de Portal.
export const barra = {
  fondo: '#0a1312',
  hover: '#13221f',
  texto: '#9db3b0',
  activo: '#ffffff',
} as const;

export const estados = {
  ok: '#16a34a',
  okOscuro: '#4ade80',
  aviso: '#d97706',
  avisoOscuro: '#fbbf24',
  error: '#dc2626',
  errorOscuro: '#f87171',
  info: '#0e7490',
  infoOscuro: '#67e8f9',
  errorFondo: '#fdecec',
  errorFondoOscuro: '#3a1414',
  avisoFondo: '#fdf3e2',
  avisoFondoOscuro: '#3a2a0c',
} as const;
