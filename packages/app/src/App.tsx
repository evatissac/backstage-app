import { createApp } from '@backstage/frontend-defaults';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import { navModule } from './modules/nav';
import { homeModule } from './modules/home';
import { signInModule } from './modules/signIn';
// Zoom con rueda y arrastre sobre las imágenes de TechDocs, incluidos los .drawio.svg.
import { techDocsLightBoxAddonModule } from '@backstage/plugin-techdocs-module-addons-contrib/alpha';

export default createApp({
  features: [
    catalogPlugin,
    navModule,
    homeModule,
    signInModule,
    techDocsLightBoxAddonModule,
  ],
});
