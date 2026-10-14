import { Link, useSearchParams } from 'react-router-dom';
import { Alert, Skeleton, Text } from '@backstage/ui';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import { textosHrl } from '../idioma';
import { useResumenCatalogo } from '../proyectos/datos';
import { tituloDe } from '../comun/entidades';
import { useCalidad, useCalidadEntidad } from './datos';
import {
  Insignia,
  ListaReglas,
  Progreso,
  ResumenCalidad,
  TablaCalidad,
} from './componentes';
import '../comun/comun.css';
import './calidad.css';

/** Botones para limitar la página a un proyecto (`?proyecto=`). */
const FiltroProyecto = (props: { actual?: string }) => {
  const { t } = useTranslationRef(textosHrl);
  const resumen = useResumenCatalogo();
  if (resumen.estado !== 'listo') return null;
  return (
    <nav className="hrl-filtro" aria-label={t('calidad.filtroProyecto')}>
      <Link to="/calidad" aria-current={!props.actual}>
        {t('calidad.todos')}
      </Link>
      {resumen.datos.proyectos.map(p => (
        <Link
          key={p.sistema.metadata.name}
          to={`/calidad?proyecto=${p.sistema.metadata.name}`}
          aria-current={props.actual === p.sistema.metadata.name}
        >
          {tituloDe(p.sistema)}
        </Link>
      ))}
    </nav>
  );
};

export const PaginaCalidad = () => {
  const { t } = useTranslationRef(textosHrl);
  const [params] = useSearchParams();
  const proyecto = params.get('proyecto') ?? undefined;
  const carga = useCalidad(proyecto);

  return (
    <div className="hrl-pagina">
      <div className="hrl-intro">
        <Text as="h1" variant="title-medium" weight="bold">
          {t('calidad.titulo')}
        </Text>
        <Text as="p" variant="body-medium" color="secondary">
          {t('calidad.intro')}
        </Text>
      </div>
      <FiltroProyecto actual={proyecto} />
      {carga.estado === 'listo' && <ResumenCalidad datos={carga.datos} />}
      <TablaCalidad carga={carga} mostrarProyecto={!proyecto} />
      <Text as="p" variant="body-small" color="secondary">
        {t('calidad.nota')}
      </Text>
    </div>
  );
};

/** Contenido de la pestaña «Calidad» en la ficha de un componente o API. */
export const PestanaCalidad = () => {
  const { t } = useTranslationRef(textosHrl);
  const { entity } = useEntity();
  const carga = useCalidadEntidad(entity);

  if (carga.estado === 'cargando')
    return <Skeleton width="100%" height={300} />;
  if (carga.estado === 'error') {
    return (
      <Alert
        status="danger"
        icon
        title={t('calidad.errorCarga')}
        description={carga.error.message}
      />
    );
  }
  const r = carga.datos;
  return (
    <div className="hrl-calidad-entidad">
      <div className="hrl-calidad-entidad__cabecera">
        <div>
          <Text as="p" variant="body-small" color="secondary">
            {t('calidad.nivelActual')}
          </Text>
          <Insignia nivel={r.nivel} grande />
        </div>
        <Progreso r={r} />
      </div>
      <ListaReglas r={r} />
    </div>
  );
};
