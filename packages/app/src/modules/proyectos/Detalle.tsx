import { Navigate, NavLink, Route, Routes, useParams } from 'react-router-dom';
import { Alert, ButtonLink, Skeleton } from '@backstage/ui';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import WidgetsIcon from '@material-ui/icons/WidgetsOutlined';
import SearchOffIcon from '@material-ui/icons/SearchOutlined';
import { textosHrl } from '../idioma';
import { EstadoVacio } from '../comun/EstadoVacio';
import {
  colorProyecto,
  rutaEntidad,
  tieneDocs,
  tituloDe,
} from '../comun/entidades';
import { Migas } from '../comun/Migas';
import { MenuAcciones } from '../autoservicio';
import { DetalleProyecto, useDetalleProyecto } from './datos';
import {
  PestanaArquitectura,
  PestanaDespliegue,
  PestanaProcesos,
  PestanaTecnologias,
} from './PestanasFicha';
import { ResumenAvance } from './Avance';
import { Documentacion, TablaPiezas } from './Piezas';
import { PestanaCalidadPruebas } from './Pruebas';
import { PestanaMiembros } from './Miembros';
import './proyectos.css';

const SECCIONES_FICHA = [
  'arquitectura',
  'tecnologias',
  'despliegue',
  'procesos',
] as const;

/**
 * Ficha técnica: una sola pestaña con sus cuatro secciones como
 * subnavegación, para que la fila de pestañas no se desborde.
 */
const FichaTecnica = (props: { base: string; sistema: string }) => {
  const { t } = useTranslationRef(textosHrl);
  const titulos = {
    arquitectura: t('proyecto.pestanaArquitectura'),
    tecnologias: t('proyecto.pestanaTecnologias'),
    despliegue: t('proyecto.pestanaDespliegue'),
    procesos: t('proyecto.pestanaProcesos'),
  };
  return (
    <div className="hrl-seccion">
      <nav className="hrl-subnav" aria-label={t('proyecto.seccionesFicha')}>
        {SECCIONES_FICHA.map(s => (
          <NavLink key={s} to={`${props.base}/ficha/${s}`}>
            {titulos[s]}
          </NavLink>
        ))}
      </nav>
      <Routes>
        <Route index element={<Navigate to="arquitectura" replace />} />
        <Route
          path="arquitectura"
          element={<PestanaArquitectura sistema={props.sistema} />}
        />
        <Route
          path="tecnologias"
          element={<PestanaTecnologias sistema={props.sistema} />}
        />
        <Route
          path="despliegue"
          element={<PestanaDespliegue sistema={props.sistema} />}
        />
        <Route
          path="procesos"
          element={<PestanaProcesos sistema={props.sistema} />}
        />
        <Route path="*" element={<Navigate to="arquitectura" replace />} />
      </Routes>
    </div>
  );
};

/**
 * Pestañas en el orden en que se entiende un proyecto: qué es, en qué va,
 * cómo está hecho, de qué piezas, dónde leer, qué tan sólido es y quiénes
 * trabajan en él.
 */
const Pestanas = (props: { base: string; d: DetalleProyecto }) => {
  const { t } = useTranslationRef(textosHrl);
  const { d } = props;
  const documentos = [d.sistema, ...d.componentes, ...d.apis].filter(tieneDocs);
  const pestanas = [
    { ruta: '', texto: t('proyecto.pestanaResumen') },
    { ruta: 'ficha', texto: t('proyecto.pestanaFicha') },
    {
      ruta: 'componentes',
      texto: t('proyecto.pestanaPiezas'),
      cuenta: d.componentes.length + d.apis.length + d.recursos.length,
    },
    {
      ruta: 'documentacion',
      texto: t('proyecto.pestanaDocumentacion'),
      cuenta: documentos.length,
    },
    { ruta: 'calidad', texto: t('proyecto.pestanaCalidadPruebas') },
    { ruta: 'miembros', texto: t('proyecto.pestanaMiembros') },
  ];
  return (
    <nav className="hrl-pestanas" aria-label={t('proyecto.secciones')}>
      {pestanas.map(p => (
        <NavLink
          key={p.ruta}
          to={p.ruta ? `${props.base}/${p.ruta}` : props.base}
          // La ficha técnica tiene subrutas: su pestaña sigue activa en ellas.
          end={p.ruta !== 'ficha'}
        >
          {p.texto}
          {p.cuenta !== undefined && (
            <span className="hrl-pestanas__cuenta">{p.cuenta}</span>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export const Detalle = () => {
  const { t } = useTranslationRef(textosHrl);
  const { nombre = '' } = useParams();
  const detalle = useDetalleProyecto(nombre);

  if (detalle.estado === 'cargando') {
    return (
      <div aria-busy>
        <Skeleton width="100%" height={220} />
        <div className="hrl-pagina">
          <Skeleton width="100%" height={160} />
        </div>
      </div>
    );
  }
  if (detalle.estado === 'error') {
    return (
      <div className="hrl-pagina">
        <Alert
          status="danger"
          icon
          title={t('proyecto.errorCarga')}
          description={detalle.error.message}
        />
      </div>
    );
  }
  const d = detalle.datos;
  if (!d) {
    return (
      <div className="hrl-pagina">
        <EstadoVacio
          icono={<SearchOffIcon />}
          titulo={t('proyecto.noExisteTitulo', { nombre })}
          descripcion={t('proyecto.noExisteDescripcion')}
          accion={
            <ButtonLink href="/proyectos" variant="secondary">
              {t('proyecto.volver')}
            </ButtonLink>
          }
        />
      </div>
    );
  }

  const color = colorProyecto(d.sistema);
  const titulo = tituloDe(d.sistema);
  const base = `/proyectos/${d.sistema.metadata.name}`;
  const sistema = d.sistema.metadata.name;

  return (
    <div
      className="hrl-subportal"
      style={{ ['--hrl-proyecto' as string]: color }}
    >
      <section className="hrl-identidad hrl-subportal__heroe">
        <Migas
          claro
          migas={[
            { texto: t('paginas.proyectos'), href: '/proyectos' },
            { texto: titulo },
          ]}
        />
        <div className="hrl-subportal__titular">
          <h1>{titulo}</h1>
          <span className="hrl-subportal__acciones">
            <MenuAcciones entidad={d.sistema} />
            <ButtonLink
              href={rutaEntidad(d.sistema)}
              variant="secondary"
              size="small"
            >
              {t('proyecto.verEnCatalogo')}
            </ButtonLink>
          </span>
        </div>
        {d.sistema.metadata.description && (
          <p className="hrl-subportal__desc">
            {d.sistema.metadata.description}
          </p>
        )}
      </section>

      <Pestanas base={base} d={d} />

      <div className="hrl-pagina">
        <Routes>
          <Route path="" element={<ResumenAvance sistema={sistema} />} />
          <Route path="avance" element={<Navigate to={base} replace />} />
          <Route
            path="ficha/*"
            element={<FichaTecnica base={base} sistema={sistema} />}
          />
          {/* Rutas anteriores: los enlaces guardados siguen sirviendo. */}
          {SECCIONES_FICHA.map(s => (
            <Route
              key={s}
              path={s}
              element={<Navigate to={`${base}/ficha/${s}`} replace />}
            />
          ))}
          <Route
            path="apis"
            element={<Navigate to={`${base}/componentes`} replace />}
          />
          <Route
            path="documentos"
            element={<Navigate to={`${base}/documentacion`} replace />}
          />
          <Route
            path="equipo"
            element={<Navigate to={`${base}/miembros`} replace />}
          />
          <Route
            path="componentes"
            element={
              <TablaPiezas
                entidades={[...d.componentes, ...d.apis, ...d.recursos]}
                vacio={
                  <EstadoVacio
                    icono={<WidgetsIcon />}
                    titulo={t('proyecto.sinComponentesTitulo')}
                    descripcion={t('proyecto.sinComponentesDescripcion')}
                  />
                }
              />
            }
          />
          <Route path="documentacion" element={<Documentacion d={d} />} />
          <Route
            path="calidad"
            element={<PestanaCalidadPruebas sistema={sistema} />}
          />
          <Route
            path="miembros"
            element={<PestanaMiembros sistema={sistema} />}
          />
        </Routes>
      </div>
    </div>
  );
};
