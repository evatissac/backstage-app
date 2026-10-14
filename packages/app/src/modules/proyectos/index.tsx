import { Route, Routes } from 'react-router-dom';
import {
  createFrontendPlugin,
  createRouteRef,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';
import FolderIcon from '@material-ui/icons/FolderSpecialOutlined';
import { Galeria } from './Galeria';
import { Detalle } from './Detalle';

export { RejillaProyectos } from './Galeria';

const rutaProyectos = createRouteRef();

/**
 * Subportales: `/proyectos` muestra un proyecto por cada System del catálogo
 * y `/proyectos/<sistema>` es la portada propia de ese proyecto.
 */
const paginaProyectos = PageBlueprint.make({
  params: {
    path: '/proyectos',
    routeRef: rutaProyectos,
    title: 'Proyectos',
    icon: <FolderIcon fontSize="inherit" />,
    loader: async () => (
      <Routes>
        <Route path="/" element={<Galeria />} />
        <Route path=":nombre/*" element={<Detalle />} />
      </Routes>
    ),
  },
});

export const proyectosPlugin = createFrontendPlugin({
  pluginId: 'proyectos',
  title: 'Proyectos',
  icon: <FolderIcon fontSize="inherit" />,
  routes: { root: rutaProyectos },
  extensions: [paginaProyectos],
});
