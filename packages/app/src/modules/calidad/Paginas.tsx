import { Link, useSearchParams } from 'react-router-dom';
import { Alert, Skeleton, Text } from '@backstage/ui';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import { textosHrl } from '../idioma';
import { useResumenCatalogo } from '../proyectos/datos';
import { tituloDe } from '../comun/entidades';
import { useCalidad, useCalidadEntidad } from './datos';
import {
  ListaReglas,
  Puntaje,
  ResumenCalidad,
  TablaCalidad,
  TablaReglas,
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
  const vista = params.get('vista') === 'reglas' ? 'reglas' : 'componentes';
  const carga = useCalidad(proyecto);
  const conVista = (v: string) => {
    const siguiente = new URLSearchParams(params);
    if (v === 'componentes') siguiente.delete('vista');
    else siguiente.set('vista', v);
    const q = siguiente.toString();
    return q ? `/calidad?${q}` : '/calidad';
  };

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
      {/* Como Scorecards y Rules en Port: por entidad o por regla. */}
      <nav className="hrl-subnav" aria-label={t('calidad.vistas')}>
        <Link
          to={conVista('componentes')}
          aria-current={vista === 'componentes' ? 'page' : undefined}
          className={vista === 'componentes' ? 'active' : undefined}
        >
          {t('calidad.vistaComponentes')}
        </Link>
        <Link
          to={conVista('reglas')}
          aria-current={vista === 'reglas' ? 'page' : undefined}
          className={vista === 'reglas' ? 'active' : undefined}
        >
          {t('calidad.vistaReglas')}
        </Link>
      </nav>
      {vista === 'reglas' ? (
        <TablaReglas carga={carga} />
      ) : (
        <TablaCalidad carga={carga} mostrarProyecto={!proyecto} />
      )}
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
            {t('calidad.columnaPuntaje')}
          </Text>
          <Puntaje r={r} />
        </div>
      </div>
      <ListaReglas r={r} />
    </div>
  );
};
