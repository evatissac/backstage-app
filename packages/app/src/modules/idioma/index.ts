import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { TranslationBlueprint } from '@backstage/plugin-app-react';
// Generado por `yarn traducciones:importar` a partir de packages/app/translations.
import recursosPlugins from '../../translations/resources';
import { textosHrlEs } from './textos';

export { textosHrl } from './textos';
export { pluginsEnEspanol } from './plugins';

// Una extensión por recurso: el nombre debe ser único, y el id del recurso
// (el de su translation ref) ya lo es.
export const idiomaModule = createFrontendModule({
  pluginId: 'app',
  extensions: [textosHrlEs, ...recursosPlugins].map(resource =>
    TranslationBlueprint.make({
      name: resource.id,
      params: { resource },
    }),
  ),
});
