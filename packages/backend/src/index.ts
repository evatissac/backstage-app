import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();

backend.add(import('@backstage/plugin-app-backend'));
backend.add(import('@backstage/plugin-proxy-backend'));

// scaffolder plugin
backend.add(import('@backstage/plugin-scaffolder-backend'));
backend.add(import('@backstage/plugin-scaffolder-backend-module-github'));
backend.add(
  import('@backstage/plugin-scaffolder-backend-module-notifications'),
);

// techdocs plugin
backend.add(import('@backstage/plugin-techdocs-backend'));

// auth plugin
backend.add(import('@backstage/plugin-auth-backend'));
// See https://backstage.io/docs/backend-system/building-backends/migrating#the-auth-plugin
backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));
// See https://backstage.io/docs/auth/guest/provider
// Login con GitHub (auth.providers.github en app-config.yaml). Reemplaza al
// módulo estándar: deja entrar a cualquier miembro de DevHRL sin esperar a que
// el catálogo importe su usuario (ver modules/ingreso.ts).
backend.add(import('./modules/ingreso'));

// catalog plugin
backend.add(import('@backstage/plugin-catalog-backend'));
backend.add(
  import('@backstage/plugin-catalog-backend-module-scaffolder-entity-model'),
);

// Descubre los repos de la organización DevHRL (catalog.providers.github en app-config.yaml)
backend.add(import('@backstage/plugin-catalog-backend-module-github'));
// Importa los miembros y equipos de DevHRL como usuarios y grupos del catálogo.
// El login no depende de esta importación (ver modules/ingreso.ts): comprueba la
// membresía en GitHub y la importación solo completa el perfil de cada persona.
backend.add(import('@backstage/plugin-catalog-backend-module-github-org'));

// See https://backstage.io/docs/features/software-catalog/configuration#subscribing-to-catalog-errors
backend.add(import('@backstage/plugin-catalog-backend-module-logs'));

// permission plugin
backend.add(import('@backstage/plugin-permission-backend'));
// See https://backstage.io/docs/permissions/getting-started for how to create your own permission policy
backend.add(
  import('@backstage/plugin-permission-backend-module-allow-all-policy'),
);

// search plugin
backend.add(import('@backstage/plugin-search-backend'));

// search engine
// See https://backstage.io/docs/features/search/search-engines
backend.add(import('@backstage/plugin-search-backend-module-pg'));

// search collators
backend.add(import('@backstage/plugin-search-backend-module-catalog'));
backend.add(import('@backstage/plugin-search-backend-module-techdocs'));

// user settings plugin
backend.add(import('@backstage/plugin-user-settings-backend'));

// notifications and signals plugins
backend.add(import('@backstage/plugin-notifications-backend'));
backend.add(import('@backstage/plugin-signals-backend'));

// Calidad (Bronce, Plata, Oro) calculada en el servidor con Tech Insights:
// los datos los recoge modules/calidad.ts y las reglas están en app-config.yaml.
backend.add(import('@backstage-community/plugin-tech-insights-backend'));
backend.add(
  import('@backstage-community/plugin-tech-insights-backend-module-jsonfc'),
);
backend.add(import('./modules/calidad'));

// Repositorios, miembros, pruebas y avance de cada proyecto, leídos de GitHub.
backend.add(import('./plugins/proyectos'));

// mcp actions plugin
backend.add(import('@backstage/plugin-mcp-actions-backend'));

backend.start();
