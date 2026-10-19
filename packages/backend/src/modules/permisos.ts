// Política de permisos del portal.
//
// - Administradores (hrl.admins en app-config.yaml, o miembros del grupo
//   `plataforma` cuando exista el equipo en GitHub): pueden todo.
// - Miembros: ven todo y usan las plantillas. Sobre una entidad del catálogo
//   solo pueden refrescarla o borrarla si son sus dueños (directamente o por su
//   equipo). No pueden quitar ubicaciones, gestionar la ingesta ni editar
//   plantillas.
//
// Cambiar cómo está construido el portal se controla en GitHub, no aquí: los
// miembros tienen solo lectura sobre DevHRL/hrl-backstage.

import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import {
  AuthorizeResult,
  isPermission,
  PolicyDecision,
} from '@backstage/plugin-permission-common';
import {
  PermissionPolicy,
  PolicyQuery,
  PolicyQueryUser,
} from '@backstage/plugin-permission-node';
import { policyExtensionPoint } from '@backstage/plugin-permission-node/alpha';
import {
  catalogConditions,
  createCatalogConditionalDecision,
} from '@backstage/plugin-catalog-backend/alpha';
import {
  catalogEntityDeletePermission,
  catalogEntityRefreshPermission,
  catalogIngestionManagePermission,
  catalogLocationDeletePermission,
} from '@backstage/plugin-catalog-common/alpha';
import { templateManagementPermission } from '@backstage/plugin-scaffolder-common/alpha';

const GRUPO_ADMIN = 'group:default/plataforma';

class PoliticaHrl implements PermissionPolicy {
  private readonly admins: Set<string>;

  constructor(usuariosAdmin: string[]) {
    // Las refs del catálogo no distinguen mayúsculas; el login de GitHub sí las trae.
    this.admins = new Set(
      usuariosAdmin.map(login => `user:default/${login}`.toLocaleLowerCase('en-US')),
    );
  }

  private esAdmin(user?: PolicyQueryUser): boolean {
    if (!user) return false;
    const ref = user.info.userEntityRef.toLocaleLowerCase('en-US');
    const grupos = user.info.ownershipEntityRefs.map(r =>
      r.toLocaleLowerCase('en-US'),
    );
    return this.admins.has(ref) || grupos.includes(GRUPO_ADMIN);
  }

  async handle(
    request: PolicyQuery,
    user?: PolicyQueryUser,
  ): Promise<PolicyDecision> {
    if (this.esAdmin(user)) {
      return { result: AuthorizeResult.ALLOW };
    }

    const { permission } = request;

    // Solo el dueño de una entidad puede refrescarla o borrarla.
    if (
      isPermission(permission, catalogEntityDeletePermission) ||
      isPermission(permission, catalogEntityRefreshPermission)
    ) {
      return createCatalogConditionalDecision(
        permission,
        catalogConditions.isEntityOwner({
          claims: user?.info.ownershipEntityRefs ?? [],
        }),
      );
    }

    // Quitar ubicaciones (el «Unregister» del portal), gestionar la ingesta y
    // editar plantillas queda para administradores.
    if (
      isPermission(permission, catalogLocationDeletePermission) ||
      isPermission(permission, catalogIngestionManagePermission) ||
      isPermission(permission, templateManagementPermission)
    ) {
      return { result: AuthorizeResult.DENY };
    }

    // El resto (leer, registrar desde plantillas, ejecutar plantillas) se permite.
    return { result: AuthorizeResult.ALLOW };
  }
}

export default createBackendModule({
  pluginId: 'permission',
  moduleId: 'hrl-permisos',
  register(reg) {
    reg.registerInit({
      deps: {
        config: coreServices.rootConfig,
        policy: policyExtensionPoint,
      },
      async init({ config, policy }) {
        const admins = config.getOptionalStringArray('hrl.admins') ?? [];
        policy.setPolicy(new PoliticaHrl(admins));
      },
    });
  },
});
