import {
  type TranslationFunction,
  useTranslationRef,
} from '@backstage/frontend-plugin-api';
import { Alert, ButtonLink, Cell, CellText, Text } from '@backstage/ui';
import CheckIcon from '@material-ui/icons/CheckCircle';
import FaltaIcon from '@material-ui/icons/RadioButtonUnchecked';
import SinEvaluarIcon from '@material-ui/icons/HelpOutline';
import InsightsIcon from '@material-ui/icons/AssessmentOutlined';
import DocIcon from '@material-ui/icons/MenuBookOutlined';
import ReadmeIcon from '@material-ui/icons/DescriptionOutlined';
import ChecklistIcon from '@material-ui/icons/PlaylistAddCheck';
import PendienteIcon from '@material-ui/icons/HourglassEmptyOutlined';
import { textosHrl } from '../idioma';
import { EstadoVacio } from '../comun/EstadoVacio';
import { IconoTipo } from '../comun/iconos';
import { Cifra } from '../comun/Cifra';
import { TablaHRL } from '../comun/TablaHRL';
import {
  partesRef,
  relaciones,
  rutaEntidad,
  rutaProyecto,
  tituloDe,
} from '../comun/entidades';
import { Carga } from '../comun/useCarga';
import {
  CATEGORIAS,
  EstadoRegla,
  pendientes,
  proporcion,
  REGLAS,
  Resultado,
} from './reglas';
import '../comun/comun.css';
import './calidad.css';

// Las claves de las reglas se arman con su id; TypeScript no puede seguir la
// plantilla, así que se afirma una clave cualquiera del mismo grupo.
type ClaveRegla = 'calidad.reglas.proyecto.titulo';
type ClaveCategoria = 'calidad.categoria.identificacion';

export const textoRegla = (
  t: TranslationFunction<typeof textosHrl.T>,
  id: string,
  campo: 'titulo' | 'porque' | 'arreglo',
) => t(`calidad.reglas.${id}.${campo}` as ClaveRegla);

const textoCategoria = (
  t: TranslationFunction<typeof textosHrl.T>,
  categoria: string,
) => t(`calidad.categoria.${categoria}` as ClaveCategoria);

/**
 * Puntaje de una entidad: «9 de 12 comprobaciones» con una barra. Sobre lo
 * evaluado: lo que aún no tiene datos no resta.
 */
export const Puntaje = ({
  r,
  compacto,
}: {
  r: Resultado;
  compacto?: boolean;
}) => {
  const { t } = useTranslationRef(textosHrl);
  if (r.sinEvaluar) {
    return (
      <span className="hrl-puntaje" data-sin-evaluar>
        <SinEvaluarIcon aria-hidden className="hrl-puntaje__icono" />
        {t('calidad.sinEvaluar')}
      </span>
    );
  }
  const texto = t('calidad.progreso', {
    cumplidas: String(r.cumplidas),
    total: String(r.evaluadas),
  });
  return (
    <span className="hrl-puntaje" data-compacto={compacto}>
      <span className="hrl-puntaje__barra" aria-hidden>
        <span style={{ width: `${(proporcion(r) ?? 0) * 100}%` }} />
      </span>
      <span className="hrl-puntaje__texto">{texto}</span>
      {r.evaluadas < r.total && (
        <span className="hrl-puntaje__nota">
          {t('calidad.faltanEvaluar', {
            cuenta: String(r.total - r.evaluadas),
          })}
        </span>
      )}
    </span>
  );
};

/** Icono y texto para lectores de pantalla de una regla en sus tres estados. */
export const EstadoReglaIcono = ({ estado }: { estado: EstadoRegla }) => {
  const { t } = useTranslationRef(textosHrl);
  let Icono = SinEvaluarIcon;
  let texto: string = t('calidad.sinEvaluarRegla');
  if (estado === true) {
    Icono = CheckIcon;
    texto = t('calidad.cumple');
  } else if (estado === false) {
    Icono = FaltaIcon;
    texto = t('calidad.noCumple');
  }
  return (
    <>
      <Icono className="hrl-regla__icono" aria-hidden />
      <span className="hrl-sr">{texto}</span>
    </>
  );
};

/** Valor de `data-ok` para el estilo de cada estado. */
export const estadoDato = (estado: EstadoRegla) =>
  estado === undefined ? 'sin-evaluar' : String(estado);

/** Una comprobación con su estado, por qué importa y cómo cumplirla. */
export const ItemRegla = (props: {
  id: string;
  estado: EstadoRegla;
  conPorque?: boolean;
}) => {
  const { t } = useTranslationRef(textosHrl);
  return (
    <li className="hrl-regla" data-ok={estadoDato(props.estado)}>
      <EstadoReglaIcono estado={props.estado} />
      <div>
        <Text as="p" variant="body-medium" weight="bold">
          {textoRegla(t, props.id, 'titulo')}
        </Text>
        {props.conPorque && (
          <Text as="p" variant="body-small" color="secondary">
            {textoRegla(t, props.id, 'porque')}
          </Text>
        )}
        {props.estado === false && (
          <p className="hrl-regla__arreglo">
            {textoRegla(t, props.id, 'arreglo')}
          </p>
        )}
        {props.estado === undefined && (
          <p className="hrl-regla__arreglo">{t('calidad.sinEvaluarAyuda')}</p>
        )}
      </div>
    </li>
  );
};

/** Todas las comprobaciones de una entidad, agrupadas por categoría. */
export const ListaReglas = ({ r }: { r: Resultado }) => {
  const { t } = useTranslationRef(textosHrl);
  return (
    <div className="hrl-niveles">
      {CATEGORIAS.map(categoria => {
        const reglas = REGLAS.filter(regla => regla.categoria === categoria);
        const cumplidas = reglas.filter(
          regla => r.reglas[regla.id] === true,
        ).length;
        return (
          <section key={categoria} className="hrl-tarjeta hrl-nivel">
            <header className="hrl-nivel__cabecera">
              <Text as="h3" variant="title-x-small" weight="bold">
                {textoCategoria(t, categoria)}
              </Text>
              <Text as="p" variant="body-small" color="secondary">
                {t('calidad.progreso', {
                  cumplidas: String(cumplidas),
                  total: String(reglas.length),
                })}
              </Text>
            </header>
            <ul className="hrl-reglas">
              {reglas.map(regla => (
                <ItemRegla
                  key={regla.id}
                  id={regla.id}
                  estado={r.reglas[regla.id]}
                  conPorque
                />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
};

const proyectoDe = (r: Resultado) => {
  const sistema = relaciones(r.entidad, 'partOf').find(x =>
    x.startsWith('system:'),
  );
  return sistema ? partesRef(sistema).name : '';
};

/** Tabla de componentes y APIs con su puntaje y lo que les falta. */
export const TablaCalidad = (props: {
  carga: Carga<Resultado[]>;
  mostrarProyecto?: boolean;
}) => {
  const { t } = useTranslationRef(textosHrl);
  const { carga } = props;
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
  const faltan = (r: Resultado) =>
    pendientes(r)
      .map(regla => textoRegla(t, regla.id, 'titulo'))
      .join(' · ');
  return (
    <TablaHRL
      id={props.mostrarProyecto ? 'calidad-todo-2' : 'calidad-proyecto-2'}
      titulo={t('calidad.titulo')}
      cargando={carga.estado === 'cargando'}
      filas={
        carga.estado === 'listo'
          ? carga.datos.map(r => ({
              id: r.entidad.metadata.uid ?? r.entidad.metadata.name,
              r,
            }))
          : undefined
      }
      vacio={
        <EstadoVacio
          icono={<InsightsIcon />}
          titulo={t('calidad.vacioTitulo')}
          descripcion={t('calidad.vacioDescripcion')}
        />
      }
      columnas={[
        {
          id: 'nombre',
          etiqueta: t('proyecto.columnaNombre'),
          principal: true,
          valor: ({ r }) => tituloDe(r.entidad),
          celda: ({ r }) => (
            <CellText
              title={tituloDe(r.entidad)}
              description={r.entidad.kind}
              href={`${rutaEntidad(r.entidad)}/calidad`}
              leadingIcon={<IconoTipo tipo={r.entidad.kind} />}
            />
          ),
        },
        {
          id: 'proyecto',
          etiqueta: t('calidad.columnaProyecto'),
          oculta: !props.mostrarProyecto,
          filtrable: props.mostrarProyecto,
          agrupable: true,
          valor: ({ r }) => proyectoDe(r),
          celda: ({ r }) =>
            proyectoDe(r) ? (
              <CellText
                title={proyectoDe(r)}
                href={rutaProyecto(proyectoDe(r))}
              />
            ) : (
              <CellText title="—" />
            ),
        },
        {
          id: 'puntaje',
          etiqueta: t('calidad.columnaPuntaje'),
          // Ordena por proporción cumplida; lo no evaluado va al final.
          valor: ({ r }) =>
            String(Math.round((proporcion(r) ?? -1) * 1000) + 1000).padStart(
              4,
              '0',
            ),
          celda: ({ r }) => (
            <Cell>
              <Puntaje r={r} compacto />
            </Cell>
          ),
        },
        {
          id: 'faltan',
          etiqueta: t('calidad.columnaFaltan'),
          valor: ({ r }) => faltan(r),
          celda: ({ r }) =>
            pendientes(r).length === 0 ? (
              <CellText title={t('calidad.todoCumplido')} color="secondary" />
            ) : (
              <CellText title={faltan(r)} />
            ),
        },
      ]}
      acciones={({ r }) => (
        <ButtonLink
          href={`${rutaEntidad(r.entidad)}/calidad`}
          variant="tertiary"
          size="small"
          aria-label={t('portada.verQueFalta', { nombre: tituloDe(r.entidad) })}
        >
          {t('portada.queFalta')}
        </ButtonLink>
      )}
    />
  );
};

/** Porcentaje, o null si no hay nada que medir: 0 de 0 no es 0 %. */
const porcentaje = (parte: number, total: number) =>
  total === 0 ? null : `${Math.round((parte / total) * 100)} %`;

/** Cifras de cobertura del conjunto. */
export const ResumenCalidad = ({ datos }: { datos: Resultado[] }) => {
  const { t } = useTranslationRef(textosHrl);
  const conRegla = (id: string) => {
    const evaluados = datos.filter(d => d.reglas[id] !== undefined);
    return porcentaje(
      evaluados.filter(d => d.reglas[id] === true).length,
      evaluados.length,
    );
  };
  const cumplidas = datos.reduce((n, d) => n + d.cumplidas, 0);
  const evaluadas = datos.reduce((n, d) => n + d.evaluadas, 0);
  return (
    <div className="hrl-cifras2">
      <Cifra
        icono={<ChecklistIcon />}
        etiqueta={t('calidad.cifraCumplidas')}
        ayuda={t('calidad.ayudaCumplidas')}
        valor={porcentaje(cumplidas, evaluadas)}
      />
      <Cifra
        icono={<DocIcon />}
        etiqueta={t('calidad.cifraDocs')}
        ayuda={t('calidad.ayudaDocs')}
        valor={conRegla('documentacion')}
      />
      <Cifra
        icono={<ReadmeIcon />}
        etiqueta={t('calidad.cifraReadme')}
        ayuda={t('calidad.ayudaReadme')}
        valor={conRegla('readme')}
      />
      <Cifra
        icono={<PendienteIcon />}
        etiqueta={t('calidad.cifraSinEvaluar')}
        ayuda={t('calidad.ayudaSinEvaluar')}
        valor={
          datos.length === 0 ? null : datos.filter(d => d.sinEvaluar).length
        }
      />
    </div>
  );
};

/**
 * Vista por comprobación (como «Rules» en Port): cuántos la cumplen de los
 * que se pudieron evaluar, y por qué importa.
 */
export const TablaReglas = ({ carga }: { carga: Carga<Resultado[]> }) => {
  const { t } = useTranslationRef(textosHrl);
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
  const datos = carga.estado === 'listo' ? carga.datos : [];
  const filas = REGLAS.map(regla => {
    const evaluados = datos.filter(d => d.reglas[regla.id] !== undefined);
    const cumplen = evaluados.filter(d => d.reglas[regla.id] === true).length;
    return {
      id: regla.id,
      regla,
      cumplen,
      evaluados: evaluados.length,
      sinEvaluar: datos.length - evaluados.length,
    };
  });
  return (
    <TablaHRL
      id="calidad-reglas-2"
      titulo={t('calidad.vistaReglas')}
      cargando={carga.estado === 'cargando'}
      filas={carga.estado === 'listo' ? filas : undefined}
      porPagina={50}
      agruparPorDefecto="categoria"
      vacio={null}
      columnas={[
        {
          id: 'regla',
          etiqueta: t('calidad.columnaRegla'),
          principal: true,
          valor: ({ regla }) => textoRegla(t, regla.id, 'titulo'),
          celda: ({ regla }) => (
            <CellText
              title={textoRegla(t, regla.id, 'titulo')}
              description={textoRegla(t, regla.id, 'porque')}
            />
          ),
        },
        {
          id: 'categoria',
          etiqueta: t('calidad.columnaCategoria'),
          filtrable: true,
          agrupable: true,
          valor: ({ regla }) => textoCategoria(t, regla.categoria),
          celda: ({ regla }) => (
            <CellText title={textoCategoria(t, regla.categoria)} />
          ),
        },
        {
          id: 'cumplen',
          etiqueta: t('calidad.columnaCumplen'),
          valor: f => String(f.cumplen).padStart(4, '0'),
          celda: f => (
            <CellText
              title={
                f.evaluados === 0
                  ? t('calidad.sinDatos')
                  : t('calidad.cumplenDe', {
                      cumplen: String(f.cumplen),
                      total: String(f.evaluados),
                    })
              }
              description={porcentaje(f.cumplen, f.evaluados) ?? undefined}
            />
          ),
        },
        {
          id: 'sinEvaluar',
          etiqueta: t('calidad.columnaSinEvaluar'),
          valor: f => String(f.sinEvaluar).padStart(4, '0'),
          celda: f => <CellText title={String(f.sinEvaluar)} />,
        },
        {
          id: 'arreglo',
          etiqueta: t('calidad.columnaArreglo'),
          oculta: true,
          valor: ({ regla }) => textoRegla(t, regla.id, 'arreglo'),
          celda: ({ regla }) => (
            <CellText title={textoRegla(t, regla.id, 'arreglo')} />
          ),
        },
      ]}
    />
  );
};
