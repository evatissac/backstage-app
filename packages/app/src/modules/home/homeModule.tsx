import {
  createFrontendModule,
  useTranslationRef,
} from '@backstage/frontend-plugin-api';
import { HomePageWidgetBlueprint } from '@backstage/plugin-home-react/alpha';
import homePlugin from '@backstage/plugin-home/alpha';
import { MarkdownContent } from '@backstage/core-components';
import { textosHrl } from '../idioma';

const Bienvenida = () => {
  const { t } = useTranslationRef(textosHrl);
  return <MarkdownContent content={t('bienvenida.content')} />;
};

const bienvenidaWidget = HomePageWidgetBlueprint.make({
  name: 'bienvenida',
  params: {
    name: 'Bienvenida',
    // `title` y `description` son texto fijo del blueprint: no cambian con el
    // idioma, igual que los títulos de las demás tarjetas de la portada. La
    // portada propia de la fase B los reemplazará.
    title: 'Bienvenida',
    description: 'Qué es este portal y por dónde empezar',
    components: async () => ({ Content: Bienvenida }),
  },
});

// Tarjetas del plugin con el título en español. Igual que en la bienvenida, el
// título del blueprint es texto fijo: se ve en español en ambos idiomas.
const conTitulo = (
  id:
    | 'home-page-widget:home/starred-entities'
    | 'home-page-widget:home/recently-visited'
    | 'home-page-widget:home/most-visited',
  title: string,
) => homePlugin.getExtension(id).override({ params: { title } });

export const homeModule = createFrontendModule({
  pluginId: 'home',
  extensions: [
    bienvenidaWidget,
    conTitulo('home-page-widget:home/starred-entities', 'Favoritos'),
    conTitulo(
      'home-page-widget:home/recently-visited',
      'Visitados recientemente',
    ),
    conTitulo('home-page-widget:home/most-visited', 'Más visitados'),
  ],
});
