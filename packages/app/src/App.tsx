import { createApp } from '@backstage/frontend-defaults';
import { navModule } from './modules/nav';
import { homeModule } from './modules/home';
import { signInModule } from './modules/signIn';
import { idiomaModule, pluginsEnEspanol } from './modules/idioma';
import { temaModule } from './modules/tema';
import { proyectosPlugin } from './modules/proyectos';
import { calidadPlugin } from './modules/calidad';
import { guiaPlugin } from './modules/guia';
import { entidadModule } from './modules/entidad';
import { catalogoModule } from './modules/catalogo';
// Zoom con rueda y arrastre sobre las imágenes de TechDocs, incluidos los .drawio.svg.
import { techDocsLightBoxAddonModule } from '@backstage/plugin-techdocs-module-addons-contrib/alpha';

export default createApp({
  features: [
    ...pluginsEnEspanol,
    proyectosPlugin,
    calidadPlugin,
    guiaPlugin,
    entidadModule,
    catalogoModule,
    navModule,
    homeModule,
    signInModule,
    idiomaModule,
    temaModule,
    techDocsLightBoxAddonModule,
  ],
});
