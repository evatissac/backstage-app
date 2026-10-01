import { createApp } from '@backstage/frontend-defaults';
import { navModule } from './modules/nav';
import { homeModule } from './modules/home';
import { signInModule } from './modules/signIn';
import { idiomaModule, pluginsEnEspanol } from './modules/idioma';
// Zoom con rueda y arrastre sobre las imágenes de TechDocs, incluidos los .drawio.svg.
import { techDocsLightBoxAddonModule } from '@backstage/plugin-techdocs-module-addons-contrib/alpha';

export default createApp({
  features: [
    ...pluginsEnEspanol,
    navModule,
    homeModule,
    signInModule,
    idiomaModule,
    techDocsLightBoxAddonModule,
  ],
});
