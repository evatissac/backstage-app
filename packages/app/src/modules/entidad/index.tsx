import { createFrontendModule } from '@backstage/frontend-plugin-api';
import {
  EntityCardBlueprint,
  EntityHeaderLayoutBlueprint,
} from '@backstage/plugin-catalog-react/alpha';

/** Cabecera propia en la ficha de todas las entidades del catálogo. */
const cabecera = EntityHeaderLayoutBlueprint.make({
  name: 'hrl',
  params: {
    loader: () => import('./Cabecera').then(m => m.CabeceraEntidad),
  },
});

// Columna derecha del resumen (tarjetas «info»), como el panel de contexto de
// Port. «Contexto» reemplaza a «Acerca de», desactivada en app-config.yaml.
const tarjetaContexto = EntityCardBlueprint.make({
  name: 'hrl-contexto',
  params: {
    type: 'info',
    filter: { $not: { kind: { $in: ['user', 'group'] } } },
    loader: () => import('./Tarjetas').then(m => <m.TarjetaContexto />),
  },
});

const tarjetaAcciones = EntityCardBlueprint.make({
  name: 'hrl-acciones',
  params: {
    type: 'info',
    loader: () => import('./Tarjetas').then(m => <m.TarjetaAcciones />),
  },
});

const tarjetaComprobaciones = EntityCardBlueprint.make({
  name: 'hrl-comprobaciones',
  params: {
    type: 'content',
    filter: { kind: { $in: ['component', 'api'] } },
    loader: () => import('./Tarjetas').then(m => <m.TarjetaComprobaciones />),
  },
});

export const entidadModule = createFrontendModule({
  pluginId: 'catalog',
  extensions: [
    cabecera,
    tarjetaComprobaciones,
    tarjetaContexto,
    tarjetaAcciones,
  ],
});
