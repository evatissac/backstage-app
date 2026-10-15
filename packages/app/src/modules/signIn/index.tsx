import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  createFrontendModule,
  useApi,
  useTranslationRef,
} from '@backstage/frontend-plugin-api';
import {
  SignInPageBlueprint,
  type SignInPageProps,
} from '@backstage/plugin-app-react';
import { SignInPage, UserIdentity } from '@backstage/core-components';
import { githubAuthApiRef } from '@backstage/core-plugin-api';
import { Alert, Button, Text } from '@backstage/ui';
import GitHubIcon from '@material-ui/icons/GitHub';
import CatalogIcon from '@material-ui/icons/AppsOutlined';
import DocIcon from '@material-ui/icons/MenuBookOutlined';
import ShieldIcon from '@material-ui/icons/VerifiedUserOutlined';
import { textosHrl } from '../idioma';
import { LogoHrl } from '../nav/Marca';
import './ingreso.css';

// Clave donde la página de ingreso de Backstage recuerda el proveedor elegido.
// Solo se usa para el invitado, que sigue entrando por esa página.
const CLAVE_PROVEEDOR = '@backstage/core:SignInPage:provider';
const desarrollo = process.env.NODE_ENV === 'development';

const leerProveedor = () => {
  try {
    return window.localStorage.getItem(CLAVE_PROVEEDOR);
  } catch {
    return null;
  }
};

const IngresoGithub = (props: SignInPageProps & { onInvitado: () => void }) => {
  const { t } = useTranslationRef(textosHrl);
  const authApi = useApi(githubAuthApiRef);
  const [searchParams] = useSearchParams();
  const errorUrl = searchParams.get('error');
  const [comprobando, setComprobando] = useState(!errorUrl);
  const [ingresando, setIngresando] = useState(false);
  const [error, setError] = useState<Error | undefined>(
    errorUrl ? new Error(errorUrl) : undefined,
  );

  // Mismo flujo que el SignInPage de Backstage con un solo proveedor: primero
  // intenta reanudar la sesión (sin ventana emergente) y, si no la hay, espera
  // a que la persona pulse el botón.
  const ingresar = async (conVentana: boolean) => {
    try {
      const respuesta = await authApi.getBackstageIdentity(
        conVentana ? { instantPopup: true } : { optional: true },
      );
      if (!respuesta) {
        if (conVentana) throw new Error(t('ingreso.sinRespuesta'));
        return;
      }
      const profile = await authApi.getProfile();
      props.onSignInSuccess(
        UserIdentity.create({ identity: respuesta.identity, authApi, profile }),
      );
    } catch (e) {
      setError(e as Error);
    } finally {
      setComprobando(false);
      setIngresando(false);
    }
  };

  useEffect(() => {
    if (!errorUrl) ingresar(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al montar.
  }, []);

  return (
    <div className="hrl-ingreso">
      <section className="hrl-ingreso__marca">
        <div className="hrl-ingreso__sello" aria-hidden>
          <LogoHrl className="hrl-ingreso__logo" />
        </div>
        <div className="hrl-ingreso__presentacion">
          <p className="hrl-ingreso__antetitulo">{t('ingreso.hospital')}</p>
          <h1>{t('portal.title')}</h1>
          <p className="hrl-ingreso__lema">{t('ingreso.lema')}</p>
        </div>
        <ul className="hrl-ingreso__puntos">
          <li>
            <CatalogIcon aria-hidden />
            <span>{t('ingreso.puntoCatalogo')}</span>
          </li>
          <li>
            <DocIcon aria-hidden />
            <span>{t('ingreso.puntoDocs')}</span>
          </li>
          <li>
            <ShieldIcon aria-hidden />
            <span>{t('ingreso.puntoPacientes')}</span>
          </li>
        </ul>
      </section>

      <section className="hrl-ingreso__panel">
        <div className="hrl-ingreso__tarjeta" aria-busy={comprobando}>
          <Text as="h2" variant="title-small" weight="bold">
            {t('ingreso.titulo')}
          </Text>
          <Text as="p" variant="body-medium" color="secondary">
            {t('ingreso.github')}
          </Text>

          {error && (
            <Alert
              status="danger"
              icon
              title={t('ingreso.error')}
              description={error.message}
            />
          )}

          <Button
            variant="primary"
            size="medium"
            className="hrl-ingreso__boton"
            iconStart={<GitHubIcon />}
            isPending={comprobando || ingresando}
            onPress={() => {
              setError(undefined);
              setIngresando(true);
              ingresar(true);
            }}
          >
            {comprobando ? t('ingreso.comprobando') : t('ingreso.conGithub')}
          </Button>

          {desarrollo && (
            <Button
              variant="tertiary"
              size="small"
              onPress={props.onInvitado}
              isDisabled={comprobando || ingresando}
            >
              {t('ingreso.invitado')}
            </Button>
          )}

          <Text
            as="p"
            variant="body-x-small"
            color="secondary"
            className="hrl-ingreso__nota"
          >
            {t('ingreso.nota')}
          </Text>
        </div>
      </section>
    </div>
  );
};

const PaginaIngreso = (props: SignInPageProps) => {
  // El invitado (solo en local) entra por la página de Backstage: su flujo usa
  // piezas internas que no se exportan. Con la clave en «guest», esa página
  // inicia la sesión sola, sin mostrarse.
  const [invitado, setInvitado] = useState(
    () => desarrollo && leerProveedor() === 'guest',
  );
  if (invitado) return <SignInPage {...props} providers={['guest']} />;
  return (
    <IngresoGithub
      {...props}
      onInvitado={() => {
        try {
          window.localStorage.setItem(CLAVE_PROVEEDOR, 'guest');
        } catch {
          // Sin almacenamiento: la página de Backstage mostrará su botón.
        }
        setInvitado(true);
      }}
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
