import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  coreExtensionData,
  createExtension,
  createExtensionInput,
} from '@backstage/frontend-plugin-api';
import { useLocation } from 'react-router-dom';
import './nav.css';

const CLAVE_PLEGADA = 'hrl:barra-plegada';

const leerPlegada = () => {
  try {
    return window.localStorage.getItem(CLAVE_PLEGADA) === 'true';
  } catch {
    return false;
  }
};

type EstadoMarco = {
  /** Barra reducida a iconos (escritorio). */
  plegada: boolean;
  alternarPlegada: () => void;
  /** Cajón abierto (pantallas estrechas). */
  cajonAbierto: boolean;
  setCajonAbierto: (abierto: boolean) => void;
};

const ContextoMarco = createContext<EstadoMarco>({
  plegada: false,
  alternarPlegada: () => {},
  cajonAbierto: false,
  setCajonAbierto: () => {},
});

export const useMarco = () => useContext(ContextoMarco);

const Marco = (props: { nav: ReactNode; contenido: ReactNode }) => {
  const [plegada, setPlegada] = useState(leerPlegada);
  const [cajonAbierto, setCajonAbierto] = useState(false);
  const { pathname } = useLocation();

  const alternarPlegada = useCallback(() => {
    setPlegada(actual => {
      try {
        window.localStorage.setItem(CLAVE_PLEGADA, String(!actual));
      } catch {
        // Sin almacenamiento (ventana privada): la preferencia dura la sesión.
      }
      return !actual;
    });
  }, []);

  // En móvil, navegar cierra el cajón.
  useEffect(() => setCajonAbierto(false), [pathname]);

  useEffect(() => {
    if (!cajonAbierto) return undefined;
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCajonAbierto(false);
    };
    window.addEventListener('keydown', alPulsar);
    return () => window.removeEventListener('keydown', alPulsar);
  }, [cajonAbierto]);

  const valor = useMemo(
    () => ({ plegada, alternarPlegada, cajonAbierto, setCajonAbierto }),
    [plegada, alternarPlegada, cajonAbierto],
  );

  return (
    <ContextoMarco.Provider value={valor}>
      <div
        className="hrl-marco"
        data-plegada={plegada}
        data-cajon={cajonAbierto}
      >
        {props.nav}
        {cajonAbierto && (
          <div
            className="hrl-marco__velo"
            onClick={() => setCajonAbierto(false)}
            aria-hidden
          />
        )}
        <div className="hrl-marco__contenido">{props.contenido}</div>
      </div>
    </ContextoMarco.Provider>
  );
};

/**
 * Reemplaza el `app/layout` de Backstage (SidebarPage), que reserva el ancho
 * de su propia barra lateral. Este marco reserva el de la barra del portal y
 * resuelve el cajón en pantallas estrechas.
 */
export const marcoHrl = createExtension({
  name: 'layout',
  attachTo: { id: 'app/root', input: 'children' },
  inputs: {
    nav: createExtensionInput([coreExtensionData.reactElement], {
      singleton: true,
    }),
    content: createExtensionInput([coreExtensionData.reactElement], {
      singleton: true,
    }),
  },
  output: [coreExtensionData.reactElement],
  factory: ({ inputs }) => [
    coreExtensionData.reactElement(
      <Marco
        nav={inputs.nav.get(coreExtensionData.reactElement)}
        contenido={inputs.content.get(coreExtensionData.reactElement)}
      />,
    ),
  ],
});
