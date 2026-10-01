import {
  createTranslationRef,
  createTranslationResource,
} from '@backstage/frontend-plugin-api';

/**
 * Textos que escribe el propio portal (no los plugins de Backstage).
 *
 * Los mensajes base van en inglés porque así los trata Backstage: son el
 * idioma de respaldo y lo que exporta `backstage-cli translations export`. El
 * español, que es el idioma por defecto, va en `textosHrlEs`. Una clave que
 * falte en español se muestra en inglés, nunca vacía.
 */
export const textosHrl = createTranslationRef({
  id: 'hrl',
  messages: {
    portal: {
      title: 'HRL Developer Portal',
    },
    ingreso: {
      github:
        'Sign in with your GitHub account, as a member of the DevHRL organization.',
    },
    barra: {
      search: 'Search',
      menu: 'Menu',
      settings: 'Settings',
    },
    // Títulos de las páginas en la barra lateral (modules/nav/Sidebar.tsx).
    paginas: {
      home: 'Home',
      catalog: 'Catalog',
      scaffolder: 'Create',
      'api-docs': 'APIs',
      'catalog-graph': 'Catalog Graph',
      techdocs: 'Docs',
      'catalog-import': 'Register a component',
      notifications: 'Notifications',
      'app-visualizer': 'Visualizer',
      'user-settings': 'Settings',
    },
    bienvenida: {
      content: [
        'The **HRL Developer Portal** gathers the systems of the Hospital Regional de Loreto, who is responsible for each one, and their technical documentation.',
        '',
        '- **Catalog**: systems, components and the teams that own them.',
        '- **Docs**: the documentation of each repository, rendered inside the portal.',
        '- **Search**: across the catalog and the documentation.',
        '',
        'No patient data belongs in this portal or in the repositories.',
      ].join('\n'),
    },
  },
});

const es = {
  'portal.title': 'Portal de Desarrollo HRL',
  'ingreso.github':
    'Ingresa con tu cuenta de GitHub, como miembro de la organización DevHRL.',
  'barra.search': 'Buscar',
  'barra.menu': 'Menú',
  'barra.settings': 'Ajustes',
  'paginas.home': 'Inicio',
  'paginas.catalog': 'Catálogo',
  'paginas.scaffolder': 'Crear',
  'paginas.api-docs': 'APIs',
  'paginas.catalog-graph': 'Grafo del catálogo',
  'paginas.techdocs': 'Documentación',
  'paginas.catalog-import': 'Registrar un componente',
  'paginas.notifications': 'Notificaciones',
  'paginas.app-visualizer': 'Visualizador',
  'paginas.user-settings': 'Ajustes',
  'bienvenida.content': [
    'El **Portal de Desarrollo HRL** reúne los sistemas del Hospital Regional de Loreto, quién responde por cada uno y su documentación técnica.',
    '',
    '- **Catálogo**: sistemas, componentes y los equipos responsables.',
    '- **Documentación**: la de cada repositorio, publicada dentro del portal.',
    '- **Búsqueda**: sobre el catálogo y la documentación.',
    '',
    'En este portal y en los repositorios no va ningún dato de pacientes.',
  ].join('\n'),
} as const;

export const textosHrlEs = createTranslationResource({
  ref: textosHrl,
  translations: {
    es: async () => ({ default: es }),
  },
});
