import { ReactNode } from 'react';
import { Flex, Text } from '@backstage/ui';
import './comun.css';

/**
 * Bloque para cuando no hay nada que mostrar. El texto debe decir por qué
 * está vacío y qué hacer, no solo «Sin datos».
 */
export const EstadoVacio = (props: {
  icono: ReactNode;
  titulo: string;
  descripcion: string;
  accion?: ReactNode;
  compacto?: boolean;
}) => (
  <div
    className={`hrl-vacio${props.compacto ? ' hrl-vacio--compacto' : ''}`}
    role="status"
  >
    <span className="hrl-vacio__icono" aria-hidden>
      {props.icono}
    </span>
    <Flex direction="column" gap="1" align="center">
      <Text as="p" variant="body-medium" weight="bold">
        {props.titulo}
      </Text>
      <Text as="p" variant="body-small" color="secondary">
        {props.descripcion}
      </Text>
    </Flex>
    {props.accion}
  </div>
);
