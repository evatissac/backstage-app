import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { NotAllowedError } from '@backstage/errors';
import { githubAuthenticator } from '@backstage/plugin-auth-backend-module-github-provider';
import {
  authProvidersExtensionPoint,
  createOAuthProviderFactory,
} from '@backstage/plugin-auth-node';

/**
 * Ingreso con GitHub: entra cualquier miembro de la organización, sin esperar
 * a que el catálogo lo conozca.
 *
 * El resolver estándar (`usernameMatchingUserEntityName`) exige que el usuario
 * ya exista como `User` en el catálogo. Esos usuarios los importa `githubOrg`
 * unos minutos después de cada arranque, y mientras tanto nadie puede entrar
 * («unable to resolve user identity»). Aquí la fuente de verdad es GitHub:
 *
 * - Si GitHub dice que NO es miembro: no entra, haya o no usuario en catálogo.
 * - Si es miembro: entra con su usuario del catálogo si ya existe y, si no,
 *   con la identidad `user:default/<login>` (la misma que tendrá luego).
 * - Si no se puede preguntar a GitHub (sin token, o la API falla): entra solo
 *   quien ya está en el catálogo, que es el comportamiento estándar.
 */

export type Membresia = 'miembro' | 'ajeno' | 'desconocida';

type Fetch = typeof fetch;

/**
 * Pregunta a GitHub si `login` es miembro de alguna de las organizaciones.
 * `GET /orgs/{org}/members/{login}`: 204 miembro, 404 no lo es, 302 si el
 * dueño del token no puede ver la lista (no es miembro), 401/403 token malo.
 */
export async function comprobarMembresia(opciones: {
  login: string;
  organizaciones: string[];
  token?: string;
  fetchFn?: Fetch;
  alAviso?: (mensaje: string) => void;
}): Promise<Membresia> {
  const { login, organizaciones, token, alAviso } = opciones;
  const peticion = opciones.fetchFn ?? fetch;
  if (!token) {
    alAviso?.('GITHUB_TOKEN sin valor: no se puede comprobar la membresía.');
    return 'desconocida';
  }

  let hayDudas = false;
  for (const org of organizaciones) {
    try {
      const respuesta = await peticion(
        `https://api.github.com/orgs/${encodeURIComponent(
          org,
        )}/members/${encodeURIComponent(login)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
          },
          redirect: 'manual',
          signal: AbortSignal.timeout(8000),
        },
      );
      if (respuesta.status === 204) return 'miembro';
      if (respuesta.status !== 404) {
        hayDudas = true;
        alAviso?.(
          `GitHub respondió ${respuesta.status} al comprobar ${login} en ${org}. ¿El token es de un miembro y tiene read:org?`,
        );
      }
    } catch (error) {
      hayDudas = true;
      alAviso?.(
        `No se pudo consultar a GitHub por ${login} en ${org}: ${
          (error as Error).message
        }`,
      );
    }
  }
  return hayDudas ? 'desconocida' : 'ajeno';
}

export const ingresoGithubModule = createBackendModule({
  pluginId: 'auth',
  moduleId: 'hrl-ingreso-github',
  register(reg) {
    reg.registerInit({
      deps: {
        providers: authProvidersExtensionPoint,
        config: coreServices.rootConfig,
        logger: coreServices.logger,
      },
      async init({ providers, config, logger }) {
        // Las mismas organizaciones que importa el catálogo.
        const organizaciones =
          config.getOptionalStringArray('catalog.providers.githubOrg.orgs') ??
          [];
        const token = config
          .getOptionalConfigArray('integrations.github')
          ?.find(c => c.getOptionalString('host') === 'github.com')
          ?.getOptionalString('token');

        providers.registerProvider({
          providerId: 'github',
          factory: createOAuthProviderFactory({
            authenticator: githubAuthenticator,
            async signInResolver({ result }, ctx) {
              const login = result.fullProfile.username;
              if (!login) {
                throw new NotAllowedError(
                  'GitHub no devolvió el nombre de usuario.',
                );
              }

              const membresia = await comprobarMembresia({
                login,
                organizaciones,
                token,
                alAviso: m => logger.warn(m),
              });
              if (membresia === 'ajeno') {
                logger.info(`Ingreso rechazado: ${login} no es miembro.`);
                throw new NotAllowedError(
                  `${login} no es miembro de ${organizaciones.join(
                    ', ',
                  )} en GitHub.`,
                );
              }

              if (membresia === 'miembro') {
                logger.info(
                  `Ingreso de ${login} (miembro de la organización).`,
                );
              }
              return ctx.signInWithCatalogUser(
                { entityRef: { name: login } },
                membresia === 'miembro'
                  ? {
                      dangerousEntityRefFallback: {
                        entityRef: { name: login },
                      },
                    }
                  : undefined,
              );
            },
          }),
        });
      },
    });
  },
});

export default ingresoGithubModule;
