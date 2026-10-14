import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { SidebarContent } from './BarraLateral';
import { marcoHrl } from './Marco';

export const navModule = createFrontendModule({
  pluginId: 'app',
  extensions: [marcoHrl, SidebarContent],
});
