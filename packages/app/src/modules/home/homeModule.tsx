import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { HomePageLayoutBlueprint } from '@backstage/plugin-home-react/alpha';

// La portada del portal reemplaza la cuadrícula de tarjetas del plugin home:
// el plugin sigue aportando la ruta, el registro de visitas y su API, pero el
// contenido es propio (Portada.tsx) y no usa los widgets.
const portada = HomePageLayoutBlueprint.make({
  params: {
    loader: async () => {
      const { Portada } = await import('./Portada');
      return () => <Portada />;
    },
  },
});

export const homeModule = createFrontendModule({
  pluginId: 'home',
  extensions: [portada],
});
