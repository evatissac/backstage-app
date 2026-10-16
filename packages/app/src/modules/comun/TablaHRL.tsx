import { Fragment, ReactElement, ReactNode, useMemo, useState } from 'react';
import {
  Button,
  ButtonIcon,
  Cell,
  Menu,
  MenuItem,
  MenuSection,
  MenuTrigger,
  SearchField,
  Select,
  Table,
  Text,
  type ColumnConfig,
} from '@backstage/ui';
import {
  storageApiRef,
  useApi,
  useTranslationRef,
} from '@backstage/frontend-plugin-api';
import ColumnasIcon from '@material-ui/icons/ViewColumnOutlined';
import ExportarIcon from '@material-ui/icons/GetAppOutlined';
import FiltroIcon from '@material-ui/icons/FilterListOutlined';
import { textosHrl } from '../idioma';
import { EstadoVacio } from './EstadoVacio';
import { EsqueletoTabla } from './Esqueletos';
import './tabla.css';

/**
 * Una columna de {@link TablaHRL}. `valor` es la versión en texto plano de la
 * celda: con ella se busca, se ordena, se filtra, se agrupa y se exporta. Sin
 * `valor`, la columna solo se muestra.
 */
export type ColumnaHRL<T> = {
  id: string;
  etiqueta: string;
  celda: (fila: T) => ReactElement;
  valor?: (fila: T) => string;
  /** Ofrece un filtro con los valores que aparecen en la columna. */
  filtrable?: boolean;
  /** Se puede agrupar la tabla por esta columna. */
  agrupable?: boolean;
  /** Oculta al principio; el usuario puede mostrarla. */
  oculta?: boolean;
  /** La columna del identificador: siempre visible y es la cabecera de fila. */
  principal?: boolean;
};

type Vista = {
  ocultas: string[];
  agrupar: string | null;
};

const VISTA_VACIA: Vista = { ocultas: [], agrupar: null };

/** Vista guardada en las preferencias del usuario, una por tabla. */
const useVista = (id: string, porDefecto: Vista) => {
  const almacen = useApi(storageApiRef).forBucket('hrl-tablas');
  const [vista, setVista] = useState<Vista>(() => {
    const guardada = almacen.snapshot<Vista>(id).value;
    return guardada ? { ...porDefecto, ...guardada } : porDefecto;
  });
  const cambiar = (siguiente: Vista) => {
    setVista(siguiente);
    // Si las preferencias no se pueden guardar, la vista dura la sesión.
    almacen.set(id, siguiente).catch(() => {});
  };
  return [vista, cambiar] as const;
};

const comparar = (a: string, b: string) =>
  a.localeCompare(b, 'es', { numeric: true, sensitivity: 'base' });

// Marca de orden de bytes: hace que Excel lea bien las tildes del CSV.
const BOM = String.fromCharCode(0xfeff);

const aCsv = (filas: string[][]) =>
  filas
    .map(f => f.map(v => `"${v.replace(/"/g, '""')}"`).join(','))
    .join('\r\n');

/**
 * Tabla común del portal, al estilo de las de Port: búsqueda, filtros por
 * columna, columnas que se ocultan, agrupación, exportación a CSV y contador
 * de resultados. La columna principal es el enlace al registro y las acciones
 * van al final de la fila.
 */
export function TablaHRL<T extends { id: string }>(props: {
  /** Clave con la que se guarda la vista del usuario. */
  id: string;
  /** Qué contiene la tabla; da nombre al archivo exportado y a la región. */
  titulo: string;
  filas: T[] | undefined;
  columnas: ColumnaHRL<T>[];
  acciones?: (fila: T) => ReactNode;
  /** Se muestra cuando no hay ninguna fila, antes de filtrar. */
  vacio: ReactNode;
  cargando?: boolean;
  error?: Error;
  porPagina?: number;
  agruparPorDefecto?: string;
}) {
  const { t } = useTranslationRef(textosHrl);
  const porPagina = props.porPagina ?? 20;
  const [vista, setVista] = useVista(props.id, {
    ...VISTA_VACIA,
    ocultas: props.columnas.filter(c => c.oculta).map(c => c.id),
    agrupar: props.agruparPorDefecto ?? null,
  });
  const [busqueda, setBusqueda] = useState('');
  const [filtros, setFiltros] = useState<Record<string, string>>({});
  const [orden, setOrden] = useState<{
    column: string;
    direction: 'ascending' | 'descending';
  } | null>(null);
  const [desde, setDesde] = useState(0);

  const conValor = props.columnas.filter(c => c.valor);
  const visibles = props.columnas.filter(
    c => c.principal || !vista.ocultas.includes(c.id),
  );
  const agrupable = props.columnas.filter(c => c.agrupable && c.valor);
  const agrupar = agrupable.find(c => c.id === vista.agrupar);

  const opcionesFiltro = useMemo(
    () =>
      Object.fromEntries(
        props.columnas
          .filter(c => c.filtrable && c.valor)
          .map(c => [
            c.id,
            [...new Set((props.filas ?? []).map(f => c.valor!(f)))]
              .filter(Boolean)
              .sort(comparar),
          ]),
      ),
    [props.columnas, props.filas],
  );

  const resultado = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    let filas = (props.filas ?? []).filter(f => {
      for (const [col, valor] of Object.entries(filtros)) {
        const c = props.columnas.find(x => x.id === col);
        if (c?.valor && c.valor(f) !== valor) return false;
      }
      return (
        !texto || conValor.some(c => c.valor!(f).toLowerCase().includes(texto))
      );
    });
    const col = orden && props.columnas.find(c => c.id === orden.column);
    if (orden && col?.valor) {
      const signo = orden.direction === 'ascending' ? 1 : -1;
      filas = [...filas].sort(
        (a, b) => signo * comparar(col.valor!(a), col.valor!(b)),
      );
    }
    return filas;
  }, [props.filas, props.columnas, conValor, busqueda, filtros, orden]);

  const grupos = useMemo(() => {
    if (!agrupar) return null;
    const mapa = new Map<string, T[]>();
    for (const f of resultado) {
      const clave = agrupar.valor!(f) || t('tabla.sinValor');
      mapa.set(clave, [...(mapa.get(clave) ?? []), f]);
    }
    return [...mapa].sort(([a], [b]) => comparar(a, b));
  }, [agrupar, resultado, t]);

  const columnConfig: ColumnConfig<T>[] = [
    ...visibles.map(c => ({
      id: c.id,
      label: c.etiqueta,
      isRowHeader: c.principal,
      isSortable: Boolean(c.valor),
      cell: c.celda,
    })),
    ...(props.acciones
      ? [
          {
            id: 'acciones',
            label: t('tabla.acciones'),
            cell: (fila: T) => (
              <Cell>
                <span className="hrl-tabla__acciones">
                  {props.acciones!(fila)}
                </span>
              </Cell>
            ),
          },
        ]
      : []),
  ];

  const exportar = () => {
    const columnas = visibles.filter(c => c.valor);
    const csv = aCsv([
      columnas.map(c => c.etiqueta),
      ...resultado.map(f => columnas.map(c => c.valor!(f))),
    ]);
    const url = URL.createObjectURL(
      new Blob([`${BOM}${csv}`], { type: 'text/csv;charset=utf-8' }),
    );
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `${props.titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')}.csv`;
    enlace.click();
    URL.revokeObjectURL(url);
  };

  const hayFiltros = busqueda !== '' || Object.keys(filtros).length > 0;
  const limpiar = () => {
    setBusqueda('');
    setFiltros({});
    setDesde(0);
  };

  if (!props.cargando && !props.error && (props.filas ?? []).length === 0) {
    return <>{props.vacio}</>;
  }

  const sinCoincidencias = (
    <EstadoVacio
      compacto
      icono={<FiltroIcon />}
      titulo={t('tabla.sinCoincidenciasTitulo')}
      descripcion={t('tabla.sinCoincidenciasDescripcion')}
      accion={
        <Button variant="secondary" size="small" onPress={limpiar}>
          {t('tabla.limpiar')}
        </Button>
      }
    />
  );

  const sort = {
    descriptor: orden,
    onSortChange: (d: { column: string | number; direction: string }) => {
      setOrden({
        column: String(d.column),
        direction: d.direction === 'descending' ? 'descending' : 'ascending',
      });
      setDesde(0);
    },
  };

  const pagina = resultado.slice(desde, desde + porPagina);
  const paginacion =
    !grupos && resultado.length > porPagina
      ? {
          type: 'page' as const,
          pageSize: porPagina,
          offset: desde,
          totalCount: resultado.length,
          hasNextPage: desde + porPagina < resultado.length,
          hasPreviousPage: desde > 0,
          onNextPage: () => setDesde(desde + porPagina),
          onPreviousPage: () => setDesde(Math.max(0, desde - porPagina)),
          showPageSizeOptions: false,
          getLabel: ({ offset = 0 }: { offset?: number }) =>
            t('tabla.rango', {
              desde: String(offset + 1),
              hasta: String(Math.min(offset + porPagina, resultado.length)),
              total: String(resultado.length),
            }),
        }
      : { type: 'none' as const };

  let cuerpo: ReactNode;
  if (props.cargando) {
    // Filas con la forma de la tabla, no una tabla vacía que luego salta.
    cuerpo = (
      <EsqueletoTabla
        sinBarra
        columnas={Math.min(Math.max(visibles.length, 2), 6)}
        filas={Math.min(porPagina, 8)}
      />
    );
  } else if (resultado.length === 0) {
    cuerpo = sinCoincidencias;
  } else if (grupos) {
    cuerpo = grupos.map(([grupo, filas]) => (
      <Fragment key={grupo}>
        <h3 className="hrl-tabla__grupo">
          {grupo}
          <span className="hrl-tabla__grupo-cuenta">{filas.length}</span>
        </h3>
        <Table
          data={filas}
          columnConfig={columnConfig}
          pagination={{ type: 'none' }}
          sort={sort}
        />
      </Fragment>
    ));
  } else {
    cuerpo = (
      <Table
        data={props.cargando ? undefined : pagina}
        isPending={props.cargando}
        error={props.error}
        columnConfig={columnConfig}
        pagination={paginacion}
        sort={sort}
      />
    );
  }

  return (
    <section className="hrl-tabla" aria-label={props.titulo}>
      <div
        className="hrl-tabla__barra"
        role="toolbar"
        aria-label={t('tabla.herramientas')}
      >
        <SearchField
          size="small"
          aria-label={t('tabla.buscarEtiqueta', { tabla: props.titulo })}
          placeholder={t('tabla.buscar')}
          value={busqueda}
          onChange={v => {
            setBusqueda(v);
            setDesde(0);
          }}
          className="hrl-tabla__buscar"
        />
        {Object.entries(opcionesFiltro).map(([col, valores]) => {
          const c = props.columnas.find(x => x.id === col)!;
          return (
            <Select
              key={col}
              size="small"
              aria-label={t('tabla.filtrarPor', { columna: c.etiqueta })}
              className="hrl-tabla__filtro"
              value={filtros[col] ?? '__todos'}
              onChange={clave => {
                const valor = String(clave ?? '__todos');
                setFiltros(f => {
                  const siguiente = { ...f };
                  if (valor === '__todos') delete siguiente[col];
                  else siguiente[col] = valor;
                  return siguiente;
                });
                setDesde(0);
              }}
              options={[
                {
                  id: '__todos',
                  label: t('tabla.todos', { columna: c.etiqueta }),
                },
                ...valores.map(v => ({ id: v, label: v })),
              ]}
            />
          );
        })}
        <span className="hrl-tabla__espacio" />
        {agrupable.length > 0 && (
          <Select
            size="small"
            aria-label={t('tabla.agruparPor')}
            className="hrl-tabla__filtro"
            value={vista.agrupar ?? '__ninguno'}
            onChange={clave => {
              const valor = String(clave ?? '__ninguno');
              setVista({
                ...vista,
                agrupar: valor === '__ninguno' ? null : valor,
              });
              setDesde(0);
            }}
            options={[
              { id: '__ninguno', label: t('tabla.sinAgrupar') },
              ...agrupable.map(c => ({
                id: c.id,
                label: t('tabla.agruparPorColumna', { columna: c.etiqueta }),
              })),
            ]}
          />
        )}
        <MenuTrigger>
          <ButtonIcon
            variant="secondary"
            size="small"
            aria-label={t('tabla.columnas')}
            icon={<ColumnasIcon />}
          />
          <Menu
            placement="bottom end"
            selectionMode="multiple"
            selectedKeys={props.columnas
              .filter(c => c.principal || !vista.ocultas.includes(c.id))
              .map(c => c.id)}
            disabledKeys={props.columnas
              .filter(c => c.principal)
              .map(c => c.id)}
            onSelectionChange={claves => {
              if (claves === 'all') {
                setVista({ ...vista, ocultas: [] });
                return;
              }
              const marcadas = new Set([...claves].map(String));
              setVista({
                ...vista,
                ocultas: props.columnas
                  .filter(c => !c.principal && !marcadas.has(c.id))
                  .map(c => c.id),
              });
            }}
          >
            <MenuSection title={t('tabla.columnasVisibles')}>
              {props.columnas.map(c => (
                <MenuItem key={c.id} id={c.id}>
                  {c.etiqueta}
                </MenuItem>
              ))}
            </MenuSection>
          </Menu>
        </MenuTrigger>
        <ButtonIcon
          variant="secondary"
          size="small"
          aria-label={t('tabla.exportar')}
          icon={<ExportarIcon />}
          onPress={exportar}
          isDisabled={resultado.length === 0}
        />
      </div>

      {cuerpo}

      <div className="hrl-tabla__pie">
        <Text as="p" variant="body-small" color="secondary" aria-live="polite">
          {props.cargando
            ? t('tabla.cargando')
            : t('tabla.resultados', {
                cuenta: String(resultado.length),
                total: String((props.filas ?? []).length),
              })}
        </Text>
        {hayFiltros && (
          <Button variant="tertiary" size="small" onPress={limpiar}>
            {t('tabla.limpiar')}
          </Button>
        )}
      </div>
    </section>
  );
}
