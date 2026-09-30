import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { SignInPageBlueprint } from '@backstage/plugin-app-react';
import { SignInPage } from '@backstage/core-components';
import { githubAuthApiRef } from '@backstage/core-plugin-api';

const paginaIngreso = SignInPageBlueprint.make({
  params: {
    loader: async () => props => (
      <SignInPage
        {...props}
        title="Portal de Desarrollo HRL"
        align="center"
        providers={[
          {
            id: 'github-auth-provider',
            title: 'GitHub',
            message: 'Ingresa con tu cuenta de GitHub, miembro de la organización DevHRL.',
            apiRef: githubAuthApiRef,
          },
          // Solo mientras se desarrolla en local; se quita junto con auth.providers.guest.
          'guest',
        ]}
      />
    ),
  },
});

export const signInModule = createFrontendModule({
  pluginId: 'app',
  extensions: [paginaIngreso],
});
