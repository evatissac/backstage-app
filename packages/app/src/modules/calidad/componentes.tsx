import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { Alert, CellText, Cell, Skeleton, Table, Text } from '@backstage/ui';
import { Link } from 'react-router-dom';
import CheckIcon from '@material-ui/icons/CheckCircle';
import FaltaIcon from '@material-ui/icons/RadioButtonUnchecked';
import MedallaIcon from '@material-ui/icons/EmojiEventsOutlined';
import SinNivelIcon from '@material-ui/icons/RemoveCircleOutline';
import InsightsIcon from '@material-ui/icons/AssessmentOutlined';
import { textosHrl } from '../idioma';
import { EstadoVacio } from '../comun/EstadoVacio';
import { IconoTipo } from '../comun/iconos';
import {
  partesRef,
  relaciones,
  rutaEntidad,
  rutaProyecto,
  tituloDe,
} from '../comun/entidades';
import { Carga } from '../comun/useCarga';
import { Nivel, NIVELES, pendientes, REGLAS, Resultado } from './reglas';
import '../comun/comun.css';
import './calidad.css';

// Las claves de las reglas se arman con su id; TypeScript no puede seguir la
// plantilla, así que se afirma una clave cualquiera del mismo grupo.
type ClaveRegla = 'calidad.reglas.responsable.titulo';

export const textoRegla = (
  t: (clave: ClaveRegla) => string,
  id: string,
  campo: 'titulo' | 'porque' | 'arreglo',
) => t(`calidad.reglas.${id}.${campo}` as ClaveRegla);

export const Insignia = (props: { nivel?: Nivel; grande?: boolean }) => {
  const { t } = useTranslationRef(textosHrl);
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

/** Barra de progreso «6 de 9 comprobaciones». */
export const Progreso = ({ r }: { r: Resultado }) => {
  const { t } = useTranslationRef(textosHrl);
  const texto = t('calidad.progreso', {
    cumplidas: String(r.cumplidas),
    total: String(r.total),
  });
  return (
    <span className="hrl-progreso" title={texto}>
      <span className="hrl-progreso__barra" aria-hidden>
        <span style={{ width: `${(r.cumplidas / r.total) * 100}%` }} />
      </span>
      <span className="hrl-progreso__texto">{texto}</span>
    </span>
  );
};

/** Todas las comprobaciones de una entidad, agrupadas por nivel. */
export const ListaReglas = ({ r }: { r: Resultado }) => {
  const { t } = useTranslationRef(textosHrl);
  return (
    <div className="hrl-niveles">
      {NIVELES.map(nivel => {
        const reglas = REGLAS.filter(regla => regla.nivel === nivel);
        const completo = reglas.every(regla => r.reglas[regla.id]);
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
                const ok = r.reglas[regla.id];
                return (
                  <li key={regla.id} className="hrl-regla" data-ok={ok}>
                    {ok ? (
                      <CheckIcon className="hrl-regla__icono" aria-hidden />
                    ) : (
                      <FaltaIcon className="hrl-regla__icono" aria-hidden />
                    )}
                    <div>
                      <Text as="p" variant="body-medium" weight="bold">
                        {textoRegla(t, regla.id, 'titulo')}
                        <span className="hrl-sr">
                          {' '}
                          {ok ? t('calidad.cumple') : t('calidad.noCumple')}
                        </span>
                      </Text>
                      <Text as="p" variant="body-small" color="secondary">
                        {textoRegla(t, regla.id, 'porque')}
                      </Text>
                      {!ok && (
                        <p className="hrl-regla__arreglo">
                          {textoRegla(t, regla.id, 'arreglo')}
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

/** Tabla de componentes y APIs con su nivel y lo que les falta. */
export const TablaCalidad = (props: {
  carga: Carga<Resultado[]>;
  mostrarProyecto?: boolean;
}) => {
  const { t } = useTranslationRef(textosHrl);
  const { carga } = props;
  if (carga.estado === 'cargando') {
    return <Skeleton width="100%" height={240} />;
  }
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
  if (carga.datos.length === 0) {
    return (
      <EstadoVacio
        icono={<InsightsIcon />}
        titulo={t('calidad.vacioTitulo')}
        descripcion={t('calidad.vacioDescripcion')}
      />
    );
  }
  const filas = carga.datos.map(r => ({
    id: r.entidad.metadata.uid ?? r.entidad.metadata.name,
    r,
  }));
  return (
    <Table
      data={filas}
      pagination={{ type: 'none' }}
      columnConfig={[
        {
          id: 'nombre',
          label: t('proyecto.columnaNombre'),
          isRowHeader: true,
          cell: ({ r }) => (
            <CellText
              title={tituloDe(r.entidad)}
              description={r.entidad.kind}
              href={`${rutaEntidad(r.entidad)}/calidad`}
              leadingIcon={<IconoTipo tipo={r.entidad.kind} />}
            />
          ),
        },
        ...(props.mostrarProyecto
          ? [
              {
                id: 'proyecto',
                label: t('calidad.columnaProyecto'),
                cell: ({ r }: { r: Resultado }) => {
                  const sistema = relaciones(r.entidad, 'partOf').find(x =>
                    x.startsWith('system:'),
                  );
                  return sistema ? (
                    <CellText
                      title={partesRef(sistema).name}
                      href={rutaProyecto(partesRef(sistema).name)}
                    />
                  ) : (
                    <CellText title="—" />
                  );
                },
              },
            ]
          : []),
        {
          id: 'nivel',
          label: t('calidad.columnaNivel'),
          cell: ({ r }) => (
            <Cell>
              <Insignia nivel={r.nivel} />
            </Cell>
          ),
        },
        {
          id: 'progreso',
          label: t('calidad.columnaProgreso'),
          cell: ({ r }) => (
            <Cell>
              <Progreso r={r} />
            </Cell>
          ),
        },
        {
          id: 'siguiente',
          label: t('calidad.columnaSiguiente'),
          cell: ({ r }) => {
            const faltan = pendientes(r);
            return faltan.length === 0 ? (
              <CellText title={t('calidad.todoCumplido')} color="secondary" />
            ) : (
              <CellText
                title={faltan
                  .map(regla => textoRegla(t, regla.id, 'titulo'))
                  .join(' · ')}
              />
            );
          },
        },
      ]}
    />
  );
};

/** Cifras de cobertura: cuántos tienen cada nivel y qué falta más. */
export const ResumenCalidad = ({ datos }: { datos: Resultado[] }) => {
  const { t } = useTranslationRef(textosHrl);
  const total = datos.length;
  const porcentaje = (n: number) =>
    total === 0 ? t('calidad.sinDatos') : `${Math.round((n / total) * 100)} %`;
  const conNivel = (n: Nivel) =>
    datos.filter(d => d.nivel && NIVELES.indexOf(d.nivel) >= NIVELES.indexOf(n))
      .length;
  const cifras = [
    {
      valor: porcentaje(datos.filter(d => d.reglas.responsable).length),
      etiqueta: t('calidad.cifraResponsable'),
      ayuda: t('calidad.ayudaResponsable'),
    },
    {
      valor: porcentaje(datos.filter(d => d.reglas.documentacion).length),
      etiqueta: t('calidad.cifraDocs'),
      ayuda: t('calidad.ayudaDocs'),
    },
    ...NIVELES.map(n => ({
      valor: String(conNivel(n)),
      etiqueta: t('calidad.cifraNivel', {
        nivel: t(`calidad.nivel.${n}` as const),
      }),
      ayuda: t(`calidad.descripcionNivel.${n}` as const),
    })),
  ];
  return (
    <div className="hrl-cifras">
      {cifras.map(c => (
        <div key={c.etiqueta} className="hrl-cifra">
          <span className="hrl-cifra__valor">{c.valor}</span>
          <span className="hrl-cifra__etiqueta">{c.etiqueta}</span>
          <span className="hrl-cifra__ayuda">{c.ayuda}</span>
        </div>
      ))}
    </div>
  );
};

/** Enlace corto a la página de calidad con el nivel de una entidad. */
export const EnlaceCalidad = ({ r }: { r: Resultado }) => (
  <Link to={`${rutaEntidad(r.entidad)}/calidad`} className="hrl-enlace-nivel">
    <Insignia nivel={r.nivel} />
  </Link>
);
