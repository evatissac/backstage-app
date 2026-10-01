import catalogPlugin from '@backstage/plugin-catalog/alpha';
import techdocsPlugin from '@backstage/plugin-techdocs/alpha';
import apiDocsPlugin from '@backstage/plugin-api-docs/alpha';
import scaffolderPlugin from '@backstage/plugin-scaffolder/alpha';
import searchPlugin from '@backstage/plugin-search/alpha';
import homePlugin from '@backstage/plugin-home/alpha';
import userSettingsPlugin from '@backstage/plugin-user-settings/alpha';
import notificationsPlugin from '@backstage/plugin-notifications/alpha';
import catalogGraphPlugin from '@backstage/plugin-catalog-graph/alpha';
import catalogImportPlugin from '@backstage/plugin-catalog-import/alpha';
import orgPlugin from '@backstage/plugin-org/alpha';
import visualizerPlugin from '@backstage/plugin-app-visualizer';

/**
 * Plugins con su título en español. El título del plugin es el que aparece en
 * las migas de pan (por ejemplo, «Catálogo» sobre la ficha de una entidad) y no
 * pasa por el sistema de traducción: es texto fijo, así que se ve en español
 * en ambos idiomas, igual que los títulos de página de app-config.yaml.
 *
 * Instalarlos aquí no los duplica: un plugin instalado explícitamente
 * reemplaza al que la app descubre sola en package.json.
 */
export const pluginsEnEspanol = [
  catalogPlugin.withOverrides({ title: 'Catálogo' }),
  techdocsPlugin.withOverrides({ title: 'Documentación' }),
  apiDocsPlugin.withOverrides({ title: 'APIs' }),
  scaffolderPlugin.withOverrides({ title: 'Crear' }),
  searchPlugin.withOverrides({ title: 'Búsqueda' }),
  homePlugin.withOverrides({ title: 'Inicio' }),
  userSettingsPlugin.withOverrides({ title: 'Ajustes' }),
  notificationsPlugin.withOverrides({ title: 'Notificaciones' }),
  catalogGraphPlugin.withOverrides({ title: 'Grafo del catálogo' }),
  catalogImportPlugin.withOverrides({ title: 'Registrar un componente' }),
  orgPlugin.withOverrides({ title: 'Organización' }),
  visualizerPlugin.withOverrides({ title: 'Visualizador' }),
];
