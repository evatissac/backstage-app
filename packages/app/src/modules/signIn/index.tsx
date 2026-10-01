import {
  createFrontendModule,
  useTranslationRef,
} from '@backstage/frontend-plugin-api';
import {
  SignInPageBlueprint,
  type SignInPageProps,
} from '@backstage/plugin-app-react';
import { SignInPage } from '@backstage/core-components';
import { githubAuthApiRef } from '@backstage/core-plugin-api';
import { textosHrl } from '../idioma';

const PaginaIngreso = (props: SignInPageProps) => {
  const { t } = useTranslationRef(textosHrl);
  return (
    <SignInPage
      {...props}
      title={t('portal.title')}
      align="center"
      providers={[
        {
          id: 'github-auth-provider',
          title: 'GitHub',
          message: t('ingreso.github'),
          apiRef: githubAuthApiRef,
        },
        // Solo en local: en producción el backend rechaza al invitado.
        ...(process.env.NODE_ENV === 'development' ? ['guest' as const] : []),
      ]}
    />
  );
};

const paginaIngreso = SignInPageBlueprint.make({
  params: {
    loader: async () => PaginaIngreso,
  },
});

export const signInModule = createFrontendModule({
  pluginId: 'app',
  extensions: [paginaIngreso],
});
