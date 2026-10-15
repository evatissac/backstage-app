import {
  createFrontendPlugin,
  createRouteRef,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import CalidadIcon from '@material-ui/icons/AssessmentOutlined';

export { useCalidad } from './datos';
export { Puntaje, TablaCalidad, ResumenCalidad } from './componentes';

const rutaCalidad = createRouteRef();

/** `/calidad`: niveles de todos los componentes y APIs, filtrables por proyecto. */
const paginaCalidad = PageBlueprint.make({
  params: {
    path: '/calidad',
    routeRef: rutaCalidad,
    title: 'Calidad',
    icon: <CalidadIcon fontSize="inherit" />,
    loader: () => import('./Paginas').then(m => <m.PaginaCalidad />),
  },
});

/** Pestaña «Calidad» en la ficha de cada componente y API del catálogo. */
const pestanaCalidad = EntityContentBlueprint.make({
  params: {
    path: 'calidad',
    title: 'Calidad',
    filter: entity => ['component', 'api'].includes(entity.kind.toLowerCase()),
    loader: () => import('./Paginas').then(m => <m.PestanaCalidad />),
  },
});

export const calidadPlugin = createFrontendPlugin({
  pluginId: 'calidad',
  title: 'Calidad',
  icon: <CalidadIcon fontSize="inherit" />,
  routes: { root: rutaCalidad },
  extensions: [paginaCalidad, pestanaCalidad],
});
