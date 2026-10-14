import WidgetsIcon from '@material-ui/icons/WidgetsOutlined';
import ApiIcon from '@material-ui/icons/SettingsEthernetOutlined';
import SistemaIcon from '@material-ui/icons/CategoryOutlined';
import GrupoIcon from '@material-ui/icons/GroupOutlined';
import PersonaIcon from '@material-ui/icons/PersonOutlineOutlined';
import RecursoIcon from '@material-ui/icons/StorageOutlined';
import DominioIcon from '@material-ui/icons/AccountTreeOutlined';
import DocIcon from '@material-ui/icons/DescriptionOutlined';

/** Icono para un tipo de entidad del catálogo (o para una página de docs). */
export const IconoTipo = (props: { tipo?: string }) => {
  switch (props.tipo?.toLowerCase()) {
    case 'component':
      return <WidgetsIcon />;
    case 'api':
      return <ApiIcon />;
    case 'system':
      return <SistemaIcon />;
    case 'group':
      return <GrupoIcon />;
    case 'user':
      return <PersonaIcon />;
    case 'resource':
      return <RecursoIcon />;
    case 'domain':
      return <DominioIcon />;
    default:
      return <DocIcon />;
  }
};
