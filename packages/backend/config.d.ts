export interface Config {
  /** Configuración propia del Portal de Desarrollo HRL. */
  hrl?: {
    /**
     * Usuarios de GitHub con permisos de administrador en el portal.
     * Ver src/modules/permissionPolicy.ts.
     */
    admins?: string[];
  };
}
