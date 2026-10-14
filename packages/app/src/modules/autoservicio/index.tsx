import {
  createFrontendPlugin,
  createRouteRef,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';
import AccionIcon from '@material-ui/icons/FlashOnOutlined';

export { MenuAcciones } from './MenuAcciones';

const rutaAutoservicio = createRouteRef();

/** `/autoservicio`: las plantillas del scaffolder presentadas como acciones. */
const paginaAutoservicio = PageBlueprint.make({
  params: {
    path: '/autoservicio',
    routeRef: rutaAutoservicio,
    title: 'Autoservicio',
    icon: <AccionIcon fontSize="inherit" />,
    loader: () => import('./Pagina').then(m => <m.PaginaAutoservicio />),
  },
});

export const autoservicioPlugin = createFrontendPlugin({
  pluginId: 'autoservicio',
  title: 'Autoservicio',
  icon: <AccionIcon fontSize="inherit" />,
  routes: { root: rutaAutoservicio },
  extensions: [paginaAutoservicio],
});
