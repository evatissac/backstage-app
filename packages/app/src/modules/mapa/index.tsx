import {
  createFrontendPlugin,
  createRouteRef,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';
import MapaIcon from '@material-ui/icons/AccountTreeOutlined';

const rutaMapa = createRouteRef();

/** `/mapa`: grafo del dominio del hospital y modelo de datos del catálogo. */
const paginaMapa = PageBlueprint.make({
  params: {
    path: '/mapa',
    routeRef: rutaMapa,
    title: 'Mapa',
    icon: <MapaIcon fontSize="inherit" />,
    loader: () => import('./Pagina').then(m => <m.PaginaMapa />),
  },
});

export const mapaPlugin = createFrontendPlugin({
  pluginId: 'mapa',
  title: 'Mapa',
  icon: <MapaIcon fontSize="inherit" />,
  routes: { root: rutaMapa },
  extensions: [paginaMapa],
});
