import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { EntityHeaderLayoutBlueprint } from '@backstage/plugin-catalog-react/alpha';

/** Cabecera propia en la ficha de todas las entidades del catálogo. */
const cabecera = EntityHeaderLayoutBlueprint.make({
  name: 'hrl',
  params: {
    loader: () => import('./Cabecera').then(m => m.CabeceraEntidad),
  },
});

export const entidadModule = createFrontendModule({
  pluginId: 'catalog',
  extensions: [cabecera],
});
