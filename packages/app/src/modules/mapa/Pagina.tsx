import { ReactNode } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Skeleton, Text } from '@backstage/ui';
import { useApi, useTranslationRef } from '@backstage/frontend-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import {
  Direction,
  EntityRelationsGraph,
} from '@backstage/plugin-catalog-graph';
import DominioIcon from '@material-ui/icons/AccountTreeOutlined';
import SistemaIcon from '@material-ui/icons/CategoryOutlined';
import ComponenteIcon from '@material-ui/icons/WidgetsOutlined';
import ApiIcon from '@material-ui/icons/SettingsEthernetOutlined';
import RecursoIcon from '@material-ui/icons/StorageOutlined';
import { textosHrl } from '../idioma';
import { useCarga } from '../comun/useCarga';
import { EstadoVacio } from '../comun/EstadoVacio';
import { Cifra } from '../comun/Cifra';
import '../comun/comun.css';
import './mapa.css';

// La raíz del mapa: el dominio del hospital en catalog/hrl.yaml.
const DOMINIO = { kind: 'domain', namespace: 'default', name: 'salud-hrl' };

const RELACIONES = [
  'partOf',
  'hasPart',
  'dependsOn',
  'dependencyOf',
  'providesApi',
  'apiProvidedBy',
  'consumesApi',
  'apiConsumedBy',
];

const Grafo = () => {
  const { t } = useTranslationRef(textosHrl);
  const navigate = useNavigate();
  const catalogo = useApi(catalogApiRef);
  const dominio = useCarga(() => catalogo.getEntityByRef(DOMINIO), [catalogo]);

  if (dominio.estado === 'cargando') {
    return <Skeleton width="100%" height={520} />;
  }
  if (dominio.estado === 'error') {
    return (
      <Alert
        status="danger"
        icon
        title={t('mapa.errorCarga')}
        description={dominio.error.message}
      />
    );
  }
  if (!dominio.datos) {
    return (
      <EstadoVacio
        icono={<DominioIcon />}
        titulo={t('mapa.sinDominioTitulo')}
        descripcion={t('mapa.sinDominioDescripcion')}
      />
    );
  }
  return (
    <section className="hrl-tarjeta hrl-mapa" aria-label={t('mapa.grafo')}>
      <div className="hrl-mapa__barra">
        <Text as="p" variant="body-small" color="secondary">
          {t('mapa.pista')}
        </Text>
      </div>
      <EntityRelationsGraph
        className="hrl-mapa__grafo"
        rootEntityNames={DOMINIO}
        maxDepth={3}
        kinds={['domain', 'system', 'component', 'api', 'resource']}
        relations={RELACIONES}
        mergeRelations
        direction={Direction.LEFT_RIGHT}
        zoom="enable-on-click"
        allowFullscreen
        onNodeClick={nodo => {
          const [kind, resto] = nodo.id.split(':');
          const [namespace, name] = resto.split('/');
          navigate(`/catalog/${namespace}/${kind}/${name}`);
        }}
      />
    </section>
  );
};

const CLASES: { kind: string; icono: ReactNode }[] = [
  { kind: 'Domain', icono: <DominioIcon /> },
  { kind: 'System', icono: <SistemaIcon /> },
  { kind: 'Component', icono: <ComponenteIcon /> },
  { kind: 'API', icono: <ApiIcon /> },
  { kind: 'Resource', icono: <RecursoIcon /> },
];

// Las claves de cada clase se arman con su nombre; se afirma una del grupo.
type ClaveClase = 'mapa.clases.domain.titulo';

/** Vista «Tarjetas»: el modelo de datos del portal y cuánto hay de cada cosa. */
const Tarjetas = () => {
  const { t } = useTranslationRef(textosHrl);
  const catalogo = useApi(catalogApiRef);
  const cuentas = useCarga(async () => {
    const r = await catalogo.getEntityFacets({ facets: ['kind'] });
    return new Map(
      r.facets.kind.map(f => [f.value.toLowerCase(), f.count] as const),
    );
  }, [catalogo]);
  return (
    <div className="hrl-cifras2">
      {CLASES.map(c => {
        const clave = c.kind.toLowerCase();
        return (
          <Cifra
            key={c.kind}
            icono={c.icono}
            etiqueta={t(`mapa.clases.${clave}.titulo` as ClaveClase)}
            ayuda={t(`mapa.clases.${clave}.ayuda` as ClaveClase)}
            cargando={cuentas.estado === 'cargando'}
            valor={
              cuentas.estado === 'listo' ? cuentas.datos.get(clave) ?? 0 : null
            }
            href={`/catalog?filters[kind]=${clave}`}
          />
        );
      })}
    </div>
  );
};

/** `/mapa`: cómo se relacionan los proyectos y sus piezas. */
export const PaginaMapa = () => {
  const { t } = useTranslationRef(textosHrl);
  const [params] = useSearchParams();
  const vista = params.get('vista') === 'tarjetas' ? 'tarjetas' : 'grafo';
  return (
    <div className="hrl-pagina">
      <div className="hrl-intro">
        <Text as="h1" variant="title-medium" weight="bold">
          {t('mapa.titulo')}
        </Text>
        <Text as="p" variant="body-medium" color="secondary">
          {t('mapa.intro')}
        </Text>
      </div>
      <nav className="hrl-subnav" aria-label={t('mapa.vistas')}>
        <Link
          to="/mapa"
          aria-current={vista === 'grafo' ? 'page' : undefined}
          className={vista === 'grafo' ? 'active' : undefined}
        >
          {t('mapa.grafo')}
        </Link>
        <Link
          to="/mapa?vista=tarjetas"
          aria-current={vista === 'tarjetas' ? 'page' : undefined}
          className={vista === 'tarjetas' ? 'active' : undefined}
        >
          {t('mapa.tarjetas')}
        </Link>
      </nav>
      {vista === 'grafo' ? <Grafo /> : <Tarjetas />}
    </div>
  );
};
