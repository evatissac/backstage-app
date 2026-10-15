import { ButtonLink, CellText, Text } from '@backstage/ui';
import { useApi, useTranslationRef } from '@backstage/frontend-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import DocIcon from '@material-ui/icons/MenuBookOutlined';
import { textosHrl } from '../idioma';
import { useCarga } from '../comun/useCarga';
import { EstadoVacio } from '../comun/EstadoVacio';
import { IconoTipo } from '../comun/iconos';
import { TablaHRL } from '../comun/TablaHRL';
import {
  Entidad,
  partesRef,
  relaciones,
  rutaDocs,
  rutaProyecto,
  tieneDocs,
  tituloDe,
} from '../comun/entidades';
import '../comun/comun.css';

const proyectoDe = (e: Entidad) => {
  if (e.kind.toLowerCase() === 'system') return e.metadata.name;
  const ref = relaciones(e, 'partOf').find(r => r.startsWith('system:'));
  return ref ? partesRef(ref).name : '';
};

/**
 * `/docs`: toda la documentación publicada en el portal. Reemplaza el índice
 * de TechDocs, que filtra y agrupa por equipo responsable; aquí se ordena por
 * proyecto.
 */
export const PaginaDocs = () => {
  const { t } = useTranslationRef(textosHrl);
  const catalogo = useApi(catalogApiRef);
  const carga = useCarga(
    async () =>
      (
        await catalogo.getEntities({
          filter: { kind: ['System', 'Component', 'API', 'Resource'] },
          order: { field: 'metadata.title', order: 'asc' },
        })
      ).items.filter(tieneDocs),
    [catalogo],
  );

  return (
    <div className="hrl-pagina">
      <div className="hrl-intro">
        <Text as="h1" variant="title-medium" weight="bold">
          {t('paginas.techdocs')}
        </Text>
        <Text as="p" variant="body-medium" color="secondary">
          {t('docs.intro')}
        </Text>
      </div>
      <TablaHRL
        id="documentacion"
        titulo={t('paginas.techdocs')}
        cargando={carga.estado === 'cargando'}
        error={carga.estado === 'error' ? carga.error : undefined}
        filas={
          carga.estado === 'listo'
            ? carga.datos.map(e => ({
                id: e.metadata.uid ?? `${e.kind}:${e.metadata.name}`,
                e,
              }))
            : undefined
        }
        agruparPorDefecto="proyecto"
        vacio={
          <EstadoVacio
            icono={<DocIcon />}
            titulo={t('proyecto.sinDocsTitulo')}
            descripcion={t('proyecto.sinDocsDescripcion')}
          />
        }
        columnas={[
          {
            id: 'documento',
            etiqueta: t('docs.columnaDocumento'),
            principal: true,
            valor: e => tituloDe(e.e),
            celda: ({ e }) => (
              <CellText
                title={tituloDe(e)}
                description={e.metadata.description}
                href={rutaDocs(e)}
                leadingIcon={<IconoTipo tipo={e.kind} />}
              />
            ),
          },
          {
            id: 'proyecto',
            etiqueta: t('calidad.columnaProyecto'),
            filtrable: true,
            agrupable: true,
            valor: ({ e }) => proyectoDe(e),
            celda: ({ e }) =>
              proyectoDe(e) ? (
                <CellText
                  title={proyectoDe(e)}
                  href={rutaProyecto(proyectoDe(e))}
                />
              ) : (
                <CellText title="—" />
              ),
          },
          {
            id: 'clase',
            etiqueta: t('proyecto.columnaClase'),
            filtrable: true,
            valor: ({ e }) => e.kind,
            celda: ({ e }) => <CellText title={e.kind} />,
          },
          {
            id: 'tipo',
            etiqueta: t('proyecto.columnaTipo'),
            filtrable: true,
            valor: ({ e }) => ((e.spec ?? {}) as { type?: string }).type ?? '',
            celda: ({ e }) => (
              <CellText
                title={((e.spec ?? {}) as { type?: string }).type ?? '—'}
              />
            ),
          },
        ]}
        acciones={({ e }) => (
          <ButtonLink
            href={rutaDocs(e)}
            variant="tertiary"
            size="small"
            aria-label={t('docs.leerDe', { nombre: tituloDe(e) })}
          >
            {t('docs.leer')}
          </ButtonLink>
        )}
      />
    </div>
  );
};
