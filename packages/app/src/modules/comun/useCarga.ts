import { DependencyList, useEffect, useState } from 'react';

export type Carga<T> =
  | { estado: 'cargando' }
  | { estado: 'error'; error: Error }
  | { estado: 'listo'; datos: T };

/**
 * Ejecuta una promesa y la vuelve a ejecutar cuando cambian las dependencias.
 * Ignora la respuesta de una ejecución anterior que llegue tarde.
 */
export function useCarga<T>(
  cargar: () => Promise<T>,
  deps: DependencyList,
): Carga<T> {
  const [carga, setCarga] = useState<Carga<T>>({ estado: 'cargando' });

  useEffect(() => {
    let vigente = true;
    setCarga({ estado: 'cargando' });
    cargar().then(
      datos => vigente && setCarga({ estado: 'listo', datos }),
      error => vigente && setCarga({ estado: 'error', error }),
    );
    return () => {
      vigente = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- las dependencias las declara quien llama.
  }, deps);

  return carga;
}
