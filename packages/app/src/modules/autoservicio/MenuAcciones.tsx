import {
  ButtonIcon,
  Menu,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
} from '@backstage/ui';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import AccionIcon from '@material-ui/icons/FlashOnOutlined';
import { textosHrl } from '../idioma';
import { Entidad, tituloDe } from '../comun/entidades';
import {
  accionesPara,
  prellenado,
  rutaPlantilla,
  usePlantillas,
} from './datos';

/**
 * Botón ⚡ de una ficha: las acciones de Autoservicio que aplican a esta
 * entidad, con el formulario ya completo con lo que la ficha sabe. Sin
 * acciones para su clase, no se muestra.
 */
export const MenuAcciones = (props: {
  entidad: Entidad;
  variante?: 'primary' | 'secondary';
}) => {
  const { t } = useTranslationRef(textosHrl);
  const carga = usePlantillas();
  if (carga.estado !== 'listo') return null;
  const acciones = accionesPara(carga.datos, props.entidad);
  if (acciones.length === 0) return null;
  return (
    <MenuTrigger>
      <ButtonIcon
        variant={props.variante ?? 'secondary'}
        aria-label={t('autoservicio.accionesDe', {
          nombre: tituloDe(props.entidad),
        })}
        icon={<AccionIcon />}
      />
      <Menu placement="bottom end">
        {acciones.map(p => (
          <MenuItem
            key={p.metadata.name}
            iconStart={<AccionIcon />}
            href={rutaPlantilla(p, prellenado(p, props.entidad))}
          >
            {tituloDe(p)}
          </MenuItem>
        ))}
        <MenuSeparator />
        <MenuItem href="/autoservicio">{t('autoservicio.verTodas')}</MenuItem>
      </Menu>
    </MenuTrigger>
  );
};
