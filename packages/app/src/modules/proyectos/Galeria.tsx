import { Alert, Skeleton, Text } from '@backstage/ui';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import FolderIcon from '@material-ui/icons/FolderOpenOutlined';
import { textosHrl } from '../idioma';
import { EstadoVacio } from '../comun/EstadoVacio';
import { ResumenCatalogo, useResumenCatalogo } from './datos';
import { Carga } from '../comun/useCarga';
import { TarjetaProyecto } from './TarjetaProyecto';
import './proyectos.css';

export const RejillaProyectos = (props: {
  resumen: Carga<ResumenCatalogo>;
  limite?: number;
}) => {
  const { t } = useTranslationRef(textosHrl);
  const { resumen } = props;

  if (resumen.estado === 'cargando') {
    return (
      <div className="hrl-proyectos-rejilla" aria-busy>
        {[0, 1, 2].map(i => (
          <Skeleton key={i} width="100%" height={300} />
        ))}
      </div>
    );
  }
  if (resumen.estado === 'error') {
    return (
      <Alert
        status="danger"
        icon
        title={t('proyectos.errorCarga')}
        description={resumen.error.message}
      />
    );
  }
  const proyectos = resumen.datos.proyectos.slice(0, props.limite);
  if (proyectos.length === 0) {
    return (
      <EstadoVacio
        icono={<FolderIcon />}
        titulo={t('proyectos.vacioTitulo')}
        descripcion={t('proyectos.vacioDescripcion')}
      />
    );
  }
  return (
    <div className="hrl-proyectos-rejilla">
      {proyectos.map(p => (
        <TarjetaProyecto key={p.sistema.metadata.name} proyecto={p} />
      ))}
    </div>
  );
};

export const Galeria = () => {
  const { t } = useTranslationRef(textosHrl);
  const resumen = useResumenCatalogo();
  return (
    <div className="hrl-pagina">
      <div className="hrl-intro">
        <Text as="h1" variant="title-medium" weight="bold">
          {t('proyectos.titulo')}
        </Text>
        <Text as="p" variant="body-medium" color="secondary">
          {t('proyectos.intro')}
        </Text>
      </div>
      <RejillaProyectos resumen={resumen} />
    </div>
  );
};
