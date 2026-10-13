import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { ThemeBlueprint } from '@backstage/plugin-app-react';
import {
  createBaseThemeOptions,
  createUnifiedTheme,
  genPageTheme,
  palettes,
  PageTheme,
  UnifiedTheme,
  UnifiedThemeProvider,
} from '@backstage/theme';
import LightIcon from '@material-ui/icons/WbSunnyOutlined';
import DarkIcon from '@material-ui/icons/Brightness2Outlined';

// Tema del portal con el aspecto de Backstage UI (https://ui.backstage.io):
// gris neutro, un solo color de acento, cabeceras planas y la fuente del
// sistema. Los colores son los tokens --bui-* de @backstage/ui/css/styles.css
// (versión 0.18); así las páginas hechas con MUI (catálogo, TechDocs, ajustes)
// se ven igual que los componentes de BUI. Si se actualiza @backstage/ui,
// revisar que los valores sigan coincidiendo.

const fuente =
  'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

// Barra lateral oscura en ambos modos: el logo es blanco.
const navegacion = {
  background: '#171717', // --bui-gray-10
  indicator: '#9cc9ff', // --bui-bg-solid (oscuro)
  color: '#a1a1a1', // --bui-gray-5
  selectedColor: '#ffffff',
  navItem: { hoverBackground: '#262626' }, // --bui-gray-9
  submenu: { background: '#262626' },
};

const claro = {
  ...palettes.light,
  primary: { main: '#1f5493' }, // --bui-bg-solid
  secondary: { main: '#1f5493' },
  background: { default: '#f5f5f5', paper: '#ffffff' }, // --bui-bg-app / neutral-1
  status: {
    ok: '#1aaf4f',
    warning: '#f18900',
    error: '#ec3b18',
    running: '#0d74ce',
    pending: '#f18900',
    aborted: '#737373',
  },
  border: '#e5e5e5', // --bui-border-1
  textSubtle: '#696969', // --bui-fg-secondary
  textVerySubtle: '#a1a1a1',
  link: '#1f5493',
  linkHover: '#163a66', // --bui-bg-solid-hover
  errorBackground: '#ffe2e2',
  warningBackground: '#ffedd5',
  infoBackground: '#dbeafe',
  errorText: '#ec3b18',
  warningText: '#f18900',
  infoText: '#0d74ce',
  navigation: navegacion,
  pinSidebarButton: { icon: '#171717', background: '#d4d4d4' },
  tabbar: { indicator: '#1f5493' },
};

const oscuro = {
  ...palettes.dark,
  primary: { main: '#9cc9ff' },
  secondary: { main: '#9cc9ff' },
  background: { default: '#333333', paper: '#424141' },
  status: {
    ok: '#1ed760',
    warning: '#f18900',
    error: '#ff5a30',
    running: '#70b8ff',
    pending: '#f18900',
    aborted: '#a1a1a1',
  },
  border: '#737373',
  textSubtle: '#a3a3a3',
  textVerySubtle: '#737373',
  link: '#9cc9ff',
  linkHover: '#83b9fd',
  errorBackground: '#300c0c',
  warningBackground: '#302008',
  infoBackground: '#132049',
  errorText: '#ff5a30',
  warningText: '#f18900',
  infoText: '#70b8ff',
  navigation: navegacion,
  pinSidebarButton: { icon: '#171717', background: '#a1a1a1' },
  tabbar: { indicator: '#9cc9ff' },
};

// Cabecera plana, sin las ondas de colores de Backstage, igual para todas las
// páginas. Los subportales por proyecto (fase B) podrán darle su propio color.
const cabecera = (fondo: string, texto: string): Record<string, PageTheme> => {
  const plana = genPageTheme({
    colors: [fondo, fondo],
    shape: 'none',
    options: { fontColor: texto },
  });
  return { home: plana, documentation: plana, tool: plana, service: plana };
};

const crearTema = (
  palette: typeof claro | typeof oscuro,
  fondoCabecera: string,
  textoCabecera: string,
  borde: string,
): UnifiedTheme =>
  createUnifiedTheme({
    ...createBaseThemeOptions({
      palette,
      fontFamily: fuente,
      defaultPageTheme: 'home',
      pageTheme: cabecera(fondoCabecera, textoCabecera),
    }),
    components: {
      BackstageHeader: {
        styleOverrides: {
          header: { boxShadow: 'none', borderBottom: `1px solid ${borde}` },
        },
      },
      // Tarjetas planas con borde, como las de BUI, en lugar de sombra.
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          rounded: { borderRadius: 8 }, // --bui-radius-3
          outlined: { borderColor: borde },
          elevation1: { border: `1px solid ${borde}` },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { textTransform: 'none', borderRadius: 6, fontWeight: 600 },
        },
      },
      MuiTab: { styleOverrides: { root: { textTransform: 'none' } } },
      MuiChip: { styleOverrides: { root: { borderRadius: 6 } } },
    },
  });

const temaClaro = crearTema(claro, '#ffffff', '#000000', '#e5e5e5');
const temaOscuro = crearTema(oscuro, '#424141', '#ffffff', '#737373');

// Mismos nombres e ids que los temas por defecto (theme:app/light y
// theme:app/dark): los reemplazan y se conserva la preferencia guardada.
const TemaClaro = ThemeBlueprint.make({
  name: 'light',
  params: {
    theme: {
      id: 'light',
      title: 'Claro',
      variant: 'light',
      icon: <LightIcon />,
      Provider: ({ children }) => (
        <UnifiedThemeProvider theme={temaClaro}>
          {children}
        </UnifiedThemeProvider>
      ),
    },
  },
});

const TemaOscuro = ThemeBlueprint.make({
  name: 'dark',
  params: {
    theme: {
      id: 'dark',
      title: 'Oscuro',
      variant: 'dark',
      icon: <DarkIcon />,
      Provider: ({ children }) => (
        <UnifiedThemeProvider theme={temaOscuro}>
          {children}
        </UnifiedThemeProvider>
      ),
    },
  },
});

export const temaModule = createFrontendModule({
  pluginId: 'app',
  extensions: [TemaClaro, TemaOscuro],
});
