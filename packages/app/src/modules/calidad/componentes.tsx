import {
  type TranslationFunction,
  useTranslationRef,
} from '@backstage/frontend-plugin-api';
import { Alert, ButtonLink, Cell, CellText, Text } from '@backstage/ui';
import { Link } from 'react-router-dom';
import CheckIcon from '@material-ui/icons/CheckCircle';
import FaltaIcon from '@material-ui/icons/RadioButtonUnchecked';
import SinEvaluarIcon from '@material-ui/icons/HelpOutline';
import MedallaIcon from '@material-ui/icons/EmojiEventsOutlined';
import SinNivelIcon from '@material-ui/icons/RemoveCircleOutline';
import InsightsIcon from '@material-ui/icons/AssessmentOutlined';
import ResponsableIcon from '@material-ui/icons/PersonOutline';
import DocIcon from '@material-ui/icons/MenuBookOutlined';
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
  EstadoRegla,
  Nivel,
  NIVELES,
  pendientes,
  REGLAS,
  Resultado,
} from './reglas';
import '../comun/comun.css';
import './calidad.css';

// Las claves de las reglas se arman con su id; TypeScript no puede seguir la
// plantilla, así que se afirma una clave cualquiera del mismo grupo.
type ClaveRegla = 'calidad.reglas.responsable.titulo';

export const textoRegla = (
  t: TranslationFunction<typeof textosHrl.T>,
  id: string,
  campo: 'titulo' | 'porque' | 'arreglo',
) => t(`calidad.reglas.${id}.${campo}` as ClaveRegla);

export const Insignia = (props: {
  nivel?: Nivel;
  grande?: boolean;
  /** Aún no hay resultados: no es lo mismo que «sin nivel». */
  sinEvaluar?: boolean;
}) => {
  const { t } = useTranslationRef(textosHrl);
  if (props.sinEvaluar) {
    return (
      <span
        className={`hrl-insignia${props.grande ? ' hrl-insignia--grande' : ''}`}
        data-nivel="sin-evaluar"
      >
        <SinEvaluarIcon aria-hidden />
        {t('calidad.sinEvaluar')}
      </span>
    );
  }
  const nivel = props.nivel ?? 'ninguno';
  return (
    <span
      className={`hrl-insignia${props.grande ? ' hrl-insignia--grande' : ''}`}
      data-nivel={nivel}
    >
      {props.nivel ? <MedallaIcon aria-hidden /> : <SinNivelIcon aria-hidden />}
      {props.nivel
        ? t(`calidad.nivel.${props.nivel}` as const)
        : t('calidad.sinNivel')}
    </span>
  );
};

/** Barra de progreso «6 de 13 comprobaciones». */
export const Progreso = ({ r }: { r: Resultado }) => {
  const { t } = useTranslationRef(textosHrl);
  const texto = t('calidad.progreso', {
    cumplidas: String(r.cumplidas),
    total: String(r.total),
  });
  return (
    <span className="hrl-progreso">
      <span className="hrl-progreso__barra" aria-hidden>
        <span style={{ width: `${(r.cumplidas / r.total) * 100}%` }} />
      </span>
      <span className="hrl-progreso__texto">{texto}</span>
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

/** Todas las comprobaciones de una entidad, agrupadas por nivel. */
export const ListaReglas = ({ r }: { r: Resultado }) => {
  const { t } = useTranslationRef(textosHrl);
  return (
    <div className="hrl-niveles">
      {NIVELES.map(nivel => {
        const reglas = REGLAS.filter(regla => regla.nivel === nivel);
        const completo = reglas.every(regla => r.reglas[regla.id] === true);
        return (
          <section
            key={nivel}
            className="hrl-tarjeta hrl-nivel"
            data-nivel={nivel}
            data-completo={completo}
          >
            <header className="hrl-nivel__cabecera">
              <Insignia nivel={nivel} />
              <Text as="p" variant="body-small" color="secondary">
                {t(`calidad.descripcionNivel.${nivel}` as const)}
              </Text>
            </header>
            <ul className="hrl-reglas">
              {reglas.map(regla => {
                const estado = r.reglas[regla.id];
                return (
                  <li
                    key={regla.id}
                    className="hrl-regla"
                    data-ok={estadoDato(estado)}
                  >
                    <EstadoReglaIcono estado={estado} />
                    <div>
                      <Text as="p" variant="body-medium" weight="bold">
                        {textoRegla(t, regla.id, 'titulo')}
                      </Text>
                      <Text as="p" variant="body-small" color="secondary">
                        {textoRegla(t, regla.id, 'porque')}
                      </Text>
                      {estado === false && (
                        <p className="hrl-regla__arreglo">
                          {textoRegla(t, regla.id, 'arreglo')}
                        </p>
                      )}
                      {estado === undefined && (
                        <p className="hrl-regla__arreglo">
                          {t('calidad.sinEvaluarAyuda')}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
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

/** Tabla de componentes y APIs con su nivel y lo que les falta. */
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
  const nivelTexto = (r: Resultado) => {
    if (r.sinEvaluar) return t('calidad.sinEvaluar');
    return r.nivel
      ? t(`calidad.nivel.${r.nivel}` as const)
      : t('calidad.sinNivel');
  };
  const siguientes = (r: Resultado) =>
    pendientes(r)
      .map(regla => textoRegla(t, regla.id, 'titulo'))
      .join(' · ');
  return (
    <TablaHRL
      id={props.mostrarProyecto ? 'calidad-todo' : 'calidad-proyecto'}
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
          id: 'nivel',
          etiqueta: t('calidad.columnaNivel'),
          filtrable: true,
          agrupable: true,
          valor: ({ r }) => nivelTexto(r),
          celda: ({ r }) => (
            <Cell>
              <Insignia nivel={r.nivel} sinEvaluar={r.sinEvaluar} />
            </Cell>
          ),
        },
        {
          id: 'progreso',
          etiqueta: t('calidad.columnaProgreso'),
          valor: ({ r }) => String(r.cumplidas).padStart(3, '0'),
          celda: ({ r }) => (
            <Cell>
              <Progreso r={r} />
            </Cell>
          ),
        },
        {
          id: 'siguiente',
          etiqueta: t('calidad.columnaSiguiente'),
          valor: ({ r }) => siguientes(r),
          celda: ({ r }) =>
            pendientes(r).length === 0 ? (
              <CellText title={t('calidad.todoCumplido')} color="secondary" />
            ) : (
              <CellText title={siguientes(r)} />
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

/** Cifras de cobertura: cuántos tienen cada nivel y qué falta más. */
export const ResumenCalidad = ({ datos }: { datos: Resultado[] }) => {
  const { t } = useTranslationRef(textosHrl);
  const evaluados = datos.filter(d => !d.sinEvaluar);
  const conNivel = (n: Nivel) =>
    evaluados.filter(
      d => d.nivel && NIVELES.indexOf(d.nivel) >= NIVELES.indexOf(n),
    ).length;
  return (
    <div className="hrl-cifras2">
      <Cifra
        icono={<ResponsableIcon />}
        etiqueta={t('calidad.cifraResponsable')}
        ayuda={t('calidad.ayudaResponsable')}
        valor={porcentaje(
          evaluados.filter(d => d.reglas.responsable === true).length,
          evaluados.length,
        )}
      />
      <Cifra
        icono={<DocIcon />}
        etiqueta={t('calidad.cifraDocs')}
        ayuda={t('calidad.ayudaDocs')}
        valor={porcentaje(
          evaluados.filter(d => d.reglas.documentacion === true).length,
          evaluados.length,
        )}
      />
      {NIVELES.map(n => (
        <Cifra
          key={n}
          icono={<MedallaIcon />}
          etiqueta={t('calidad.cifraNivel', {
            nivel: t(`calidad.nivel.${n}` as const),
          })}
          ayuda={t(`calidad.descripcionNivel.${n}` as const)}
          valor={evaluados.length === 0 ? null : conNivel(n)}
        />
      ))}
    </div>
  );
};

/**
 * Vista por regla (como «Rules» en Port): cuántos la cumplen de los que se
 * pudieron evaluar, y por qué importa.
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
      id="calidad-reglas"
      titulo={t('calidad.vistaReglas')}
      cargando={carga.estado === 'cargando'}
      filas={carga.estado === 'listo' ? filas : undefined}
      porPagina={50}
      agruparPorDefecto="nivel"
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
          id: 'nivel',
          etiqueta: t('calidad.columnaNivel'),
          filtrable: true,
          agrupable: true,
          valor: ({ regla }) => t(`calidad.nivel.${regla.nivel}` as const),
          celda: ({ regla }) => (
            <Cell>
              <Insignia nivel={regla.nivel} />
            </Cell>
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

/** Enlace corto a la página de calidad con el nivel de una entidad. */
export const EnlaceCalidad = ({ r }: { r: Resultado }) => (
  <Link to={`${rutaEntidad(r.entidad)}/calidad`} className="hrl-enlace-nivel">
    <Insignia nivel={r.nivel} sinEvaluar={r.sinEvaluar} />
  </Link>
);
