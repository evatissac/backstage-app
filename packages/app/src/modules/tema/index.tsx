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
import { barra, diurno, estados, nocturno, verdeAgua } from './paleta';

// Tema de las páginas que Backstage aún dibuja con Material UI (catálogo,
// TechDocs, ajustes). Las páginas propias del portal usan Backstage UI y toman
// sus colores de tokens.css; este tema existe para que ambas se vean como una
// sola aplicación. Los valores salen de paleta.ts.

// Igual que --bui-font-regular en tokens.css (Figtree, cargada en index.html).
const fuente =
  'Figtree, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';

// La barra lateral es propia (modules/nav), pero algunos componentes de
// Backstage siguen leyendo estos valores.
const navegacion = {
  background: barra.fondo,
  indicator: verdeAgua[300],
  color: barra.texto,
  selectedColor: barra.activo,
  navItem: { hoverBackground: barra.hover },
  submenu: { background: barra.hover },
};

const claro = {
  ...palettes.light,
  primary: { main: verdeAgua[700] },
  secondary: { main: verdeAgua[600] },
  background: { default: diurno.app, paper: diurno.superficie1 },
  status: {
    ok: estados.ok,
    warning: estados.aviso,
    error: estados.error,
    running: estados.info,
    pending: estados.aviso,
    aborted: diurno.textoTenue,
  },
  border: diurno.borde,
  textSubtle: diurno.textoSecundario,
  textVerySubtle: diurno.textoTenue,
  link: verdeAgua[700],
  linkHover: verdeAgua[800],
  errorBackground: estados.errorFondo,
  warningBackground: estados.avisoFondo,
  infoBackground: verdeAgua[50],
  errorText: estados.error,
  warningText: estados.aviso,
  infoText: verdeAgua[700],
  navigation: navegacion,
  pinSidebarButton: { icon: barra.fondo, background: verdeAgua[100] },
  tabbar: { indicator: verdeAgua[600] },
};

const oscuro = {
  ...palettes.dark,
  primary: { main: verdeAgua[300] },
  secondary: { main: verdeAgua[200] },
  background: { default: nocturno.app, paper: nocturno.superficie1 },
  status: {
    ok: estados.okOscuro,
    warning: estados.avisoOscuro,
    error: estados.errorOscuro,
    running: estados.infoOscuro,
    pending: estados.avisoOscuro,
    aborted: nocturno.textoTenue,
  },
  border: nocturno.borde,
  textSubtle: nocturno.textoSecundario,
  textVerySubtle: nocturno.textoTenue,
  link: verdeAgua[300],
  linkHover: verdeAgua[200],
  errorBackground: estados.errorFondoOscuro,
  warningBackground: estados.avisoFondoOscuro,
  infoBackground: verdeAgua[950],
  errorText: estados.errorOscuro,
  warningText: estados.avisoOscuro,
  infoText: verdeAgua[200],
  navigation: navegacion,
  pinSidebarButton: { icon: barra.fondo, background: verdeAgua[300] },
  tabbar: { indicator: verdeAgua[300] },
};

// Cabecera plana, sin las ondas de colores de Backstage. Las páginas propias
// tienen su propia cabecera; esta queda para las de Material UI.
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
  panelFiltros: string,
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
          rounded: { borderRadius: 12 }, // --bui-radius-4
          outlined: { borderColor: borde },
          elevation1: { border: `1px solid ${borde}` },
          elevation2: { border: `1px solid ${borde}` },
        },
      },
      MuiCard: {
        styleOverrides: { root: { border: `1px solid ${borde}` } },
      },
      MuiButton: {
        styleOverrides: {
          root: { textTransform: 'none', borderRadius: 8, fontWeight: 600 },
        },
      },
      MuiTab: { styleOverrides: { root: { textTransform: 'none' } } },
      // Algunas etiquetas usan la tipografía «button» («CATEGORÍAS» en Crear).
      MuiTypography: {
        styleOverrides: { button: { textTransform: 'none' } },
      },
      MuiChip: { styleOverrides: { root: { borderRadius: 6 } } },
      // Las tablas de Backstage ponen las cabeceras en mayúsculas.
      BackstageTableHeader: {
        styleOverrides: {
          header: {
            textTransform: 'none',
            borderTopColor: borde,
            borderBottomColor: borde,
          },
        },
      },
      // «VER EL CÓDIGO», «VER DOCUMENTACIÓN» en la tarjeta «Acerca de».
      BackstageIconLinkVertical: {
        styleOverrides: {
          label: { textTransform: 'none', letterSpacing: 0 },
        },
      },
      // El panel «Propios / Favoritos / Todos» del catálogo trae un gris fijo.
      CatalogReactUserListPicker: {
        styleOverrides: {
          root: {
            backgroundColor: panelFiltros,
            border: `1px solid ${borde}`,
          },
          title: { textTransform: 'none', fontSize: 13 },
        },
      },
    } as Record<string, unknown>,
  });

const temaClaro = crearTema(
  claro,
  diurno.superficie1,
  barra.fondo,
  diurno.borde,
  diurno.superficie1,
);
const temaOscuro = crearTema(
  oscuro,
  nocturno.superficie1,
  barra.activo,
  nocturno.borde,
  nocturno.superficie1,
);

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
