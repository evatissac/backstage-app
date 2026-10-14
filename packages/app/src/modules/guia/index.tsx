import {
  createFrontendPlugin,
  createRouteRef,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';
import GuiaIcon from '@material-ui/icons/FlagOutlined';

export { ListaPrimerosPasos } from './Lista';

const rutaGuia = createRouteRef();

/** `/primeros-pasos`: cómo empezar a usar el portal y cómo sumar un repo. */
const paginaGuia = PageBlueprint.make({
  params: {
    path: '/primeros-pasos',
    routeRef: rutaGuia,
    title: 'Primeros pasos',
    icon: <GuiaIcon fontSize="inherit" />,
    loader: () => import('./Guia').then(m => <m.Guia />),
  },
});

export const guiaPlugin = createFrontendPlugin({
  pluginId: 'guia',
  title: 'Primeros pasos',
  icon: <GuiaIcon fontSize="inherit" />,
  routes: { root: rutaGuia },
  extensions: [paginaGuia],
});
