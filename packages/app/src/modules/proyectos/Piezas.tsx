import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ButtonLink, Cell, CellText, Skeleton, Text } from '@backstage/ui';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import DocIcon from '@material-ui/icons/DescriptionOutlined';
import WikiIcon from '@material-ui/icons/MenuBookOutlined';
import CodigoIcon from '@material-ui/icons/CodeOutlined';
import { textosHrl } from '../idioma';
import { EstadoVacio } from '../comun/EstadoVacio';
import { IconoTipo } from '../comun/iconos';
import { TablaHRL } from '../comun/TablaHRL';
import { Etiqueta, estiloCiclo } from '../comun/Etiqueta';
import {
  Entidad,
  rutaDocs,
  rutaEntidad,
  tieneDocs,
  tituloDe,
} from '../comun/entidades';
import { DetalleProyecto } from './datos';
import { PestanaDocumentos } from './PestanasFicha';
import { useRepositorios } from './github';

const specDe = (e: Entidad) =>
  (e.spec ?? {}) as { type?: string; lifecycle?: string };

/**
 * Componentes, APIs y recursos del proyecto en una sola tabla. El nombre es
 * el enlace a su ficha y la última columna repite el acceso como botón.
 */
export const TablaPiezas = (props: {
  entidades: Entidad[];
  vacio: ReactNode;
}) => {
  const { t } = useTranslationRef(textosHrl);
  const clase = (e: Entidad) => {
    const k = e.kind.toLowerCase();
    return k === 'component' || k === 'api' || k === 'resource'
      ? t(`proyecto.clase.${k}` as const)
      : e.kind;
  };
  return (
    <TablaHRL
      id="proyecto-piezas-2"
      titulo={t('proyecto.pestanaPiezas')}
      filas={props.entidades.map(e => ({
        id: e.metadata.uid ?? `${e.kind}:${e.metadata.name}`,
        e,
      }))}
      vacio={props.vacio}
      agruparPorDefecto="clase"
      columnas={[
        {
          id: 'nombre',
          etiqueta: t('proyecto.columnaNombre'),
          principal: true,
          valor: ({ e }) => tituloDe(e),
          celda: ({ e }) => (
            <CellText
              title={tituloDe(e)}
              description={e.metadata.description}
              href={rutaEntidad(e)}
              leadingIcon={<IconoTipo tipo={e.kind} />}
            />
          ),
        },
        {
          id: 'clase',
          etiqueta: t('proyecto.columnaClase'),
          filtrable: true,
          agrupable: true,
          valor: ({ e }) => clase(e),
          celda: ({ e }) => <CellText title={clase(e)} />,
        },
        {
          id: 'tipo',
          etiqueta: t('proyecto.columnaTipo'),
          filtrable: true,
          agrupable: true,
          valor: ({ e }) => specDe(e).type ?? '',
          celda: ({ e }) => <CellText title={specDe(e).type ?? '—'} />,
        },
        {
          id: 'ciclo',
          etiqueta: t('proyecto.columnaCiclo'),
          filtrable: true,
          agrupable: true,
          valor: ({ e }) => specDe(e).lifecycle ?? '',
          celda: ({ e }) => {
            const ciclo = specDe(e).lifecycle;
            return ciclo ? (
              <Cell>
                <Etiqueta texto={ciclo} {...estiloCiclo(ciclo)} />
              </Cell>
            ) : (
              <CellText title="—" />
            );
          },
        },
        {
          id: 'docs',
          etiqueta: t('proyecto.columnaDocs'),
          filtrable: true,
          valor: ({ e }) =>
            tieneDocs(e) ? t('proyecto.conDocs') : t('proyecto.sinDocs'),
          celda: ({ e }) =>
            tieneDocs(e) ? (
              <CellText
                title={t('proyecto.abrirDocs')}
                href={rutaDocs(e)}
                leadingIcon={<DocIcon />}
              />
            ) : (
              <CellText title={t('proyecto.sinDocs')} color="secondary" />
            ),
        },
      ]}
      acciones={({ e }) => (
        <ButtonLink
          href={rutaEntidad(e)}
          variant="tertiary"
          size="small"
          aria-label={t('proyecto.abrirFicha', { nombre: tituloDe(e) })}
        >
          {t('proyecto.abrir')}
        </ButtonLink>
      )}
    />
  );
};

const Seccion = (props: {
  id: string;
  titulo: string;
  ayuda: string;
  children: ReactNode;
}) => (
  <section className="hrl-seccion" aria-labelledby={props.id}>
    <div className="hrl-intro">
      <Text as="h2" id={props.id} variant="title-small" weight="bold">
        {props.titulo}
      </Text>
      <Text as="p" variant="body-small" color="secondary">
        {props.ayuda}
      </Text>
    </div>
    {props.children}
  </section>
);

/** Wiki del proyecto: TechDocs de cada pieza y la wiki de GitHub si existe. */
const Wiki = ({ d }: { d: DetalleProyecto }) => {
  const { t } = useTranslationRef(textosHrl);
  const repos = useRepositorios(d.sistema.metadata.name);
  const documentos = [d.sistema, ...d.componentes, ...d.apis].filter(tieneDocs);
  const wikis =
    repos.estado === 'listo'
      ? repos.datos.repositorios.filter(r => r.wiki)
      : [];
  if (repos.estado === 'cargando' && documentos.length === 0) {
    return <Skeleton width="100%" height={120} />;
  }
  if (documentos.length === 0 && wikis.length === 0) {
    return (
      <EstadoVacio
        compacto
        icono={<WikiIcon />}
        titulo={t('proyecto.sinDocsTitulo')}
        descripcion={t('proyecto.sinDocsDescripcion')}
      />
    );
  }
  return (
    <ul className="hrl-enlaces">
      {documentos.map(e => (
        <li key={`${e.kind}:${e.metadata.name}`}>
          <Link to={rutaDocs(e)} className="hrl-enlaces__item">
            <WikiIcon aria-hidden />
            <span>
              <strong>{tituloDe(e)}</strong>
              <span>
                {e.metadata.description ?? t('proyectos.sinDescripcion')}
              </span>
            </span>
          </Link>
        </li>
      ))}
      {wikis.map(r => (
        <li key={r.slug}>
          <a
            href={r.wiki!}
            target="_blank"
            rel="noopener noreferrer"
            className="hrl-enlaces__item"
          >
            <WikiIcon aria-hidden />
            <span>
              <strong>{t('proyecto.wikiGithub', { repo: r.slug })}</strong>
              <span>{t('proyecto.wikiGithubAyuda')}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
};

/** Repositorios del proyecto, con su README como primera lectura. */
const Repositorios = ({ d }: { d: DetalleProyecto }) => {
  const { t } = useTranslationRef(textosHrl);
  const repos = useRepositorios(d.sistema.metadata.name);
  if (repos.estado === 'cargando') return <Skeleton width="100%" height={80} />;
  if (repos.estado === 'error') {
    return (
      <Text as="p" variant="body-small" color="danger">
        {repos.error.message}
      </Text>
    );
  }
  if (repos.datos.repositorios.length === 0) {
    return (
      <EstadoVacio
        compacto
        icono={<CodigoIcon />}
        titulo={t('proyecto.sinReposTitulo')}
        descripcion={t('proyecto.sinReposDescripcion')}
      />
    );
  }
  return (
    <ul className="hrl-enlaces">
      {repos.datos.repositorios.map(r => (
        <li key={r.slug}>
          <a
            href={`${r.url}#readme`}
            target="_blank"
            rel="noopener noreferrer"
            className="hrl-enlaces__item"
          >
            <CodigoIcon aria-hidden />
            <span>
              <strong>{r.slug}</strong>
              <span>{r.descripcion ?? t('proyecto.leerReadme')}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
};

/**
 * Dónde leer sobre el proyecto, en orden: la wiki (TechDocs), los
 * repositorios con su README y los documentos institucionales.
 */
export const Documentacion = ({ d }: { d: DetalleProyecto }) => {
  const { t } = useTranslationRef(textosHrl);
  return (
    <div className="hrl-seccion">
      <Seccion
        id="hrl-docs-wiki"
        titulo={t('proyecto.docsTecnicos')}
        ayuda={t('proyecto.docsTecnicosAyuda')}
      >
        <Wiki d={d} />
      </Seccion>
      <Seccion
        id="hrl-docs-repos"
        titulo={t('proyecto.repositorios')}
        ayuda={t('proyecto.repositoriosAyuda')}
      >
        <Repositorios d={d} />
      </Seccion>
      <Seccion
        id="hrl-docs-institucionales"
        titulo={t('proyecto.docsInstitucionales')}
        ayuda={t('proyecto.docsInstitucionalesAyuda')}
      >
        <PestanaDocumentos sistema={d.sistema.metadata.name} />
      </Seccion>
    </div>
  );
};
