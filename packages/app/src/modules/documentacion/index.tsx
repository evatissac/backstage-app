import {
  createFrontendModule,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';
import techdocsPlugin from '@backstage/plugin-techdocs/alpha';
import DocIcon from '@material-ui/icons/MenuBookOutlined';

/**
 * Reemplaza el índice de TechDocs (`page:techdocs`) por uno sin equipos
 * responsables. El lector de cada documento (`page:techdocs/reader`) sigue
 * siendo el de Backstage.
 */
const paginaDocs = PageBlueprint.make({
  params: {
    path: '/docs',
    routeRef: techdocsPlugin.routes.root,
    title: 'Documentación',
    icon: <DocIcon fontSize="inherit" />,
    loader: () => import('./PaginaDocs').then(m => <m.PaginaDocs />),
  },
});

export const documentacionModule = createFrontendModule({
  pluginId: 'techdocs',
  extensions: [paginaDocs],
});
