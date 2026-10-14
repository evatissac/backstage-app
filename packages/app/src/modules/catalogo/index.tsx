import {
  coreExtensionData,
  createExtensionInput,
  createFrontendModule,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import CategoryIcon from '@material-ui/icons/Category';

/**
 * Reemplaza `page:catalog` para traducir el título de la tabla. Declara la
 * misma entrada `filters` que la página original, así los filtros del
 * catálogo (tipo, responsable, etiquetas…) siguen colgando de ella.
 */
const paginaCatalogo = PageBlueprint.makeWithOverrides({
  inputs: {
    filters: createExtensionInput([coreExtensionData.reactElement]),
  },
  factory(originalFactory, { inputs }) {
    return originalFactory({
      path: '/catalog',
      routeRef: catalogPlugin.routes.catalogIndex,
      title: 'Catálogo',
      icon: <CategoryIcon fontSize="inherit" />,
      loader: async () => {
        const { PaginaCatalogo } = await import('./PaginaCatalogo');
        const filtros = inputs.filters.map(f =>
          f.get(coreExtensionData.reactElement),
        );
        return <PaginaCatalogo filtros={<>{filtros}</>} />;
      },
    });
  },
});

export const catalogoModule = createFrontendModule({
  pluginId: 'catalog',
  extensions: [paginaCatalogo],
});
