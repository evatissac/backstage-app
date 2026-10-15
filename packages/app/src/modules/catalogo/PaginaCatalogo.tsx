import { ReactNode } from 'react';
import { ButtonLink, Container, Header } from '@backstage/ui';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import {
  CatalogFilterLayout,
  EntityListProvider,
  useEntityList,
} from '@backstage/plugin-catalog-react';
import { CatalogTable } from '@backstage/plugin-catalog';
import AddIcon from '@material-ui/icons/Add';
import { textosHrl } from '../idioma';
import './catalogo.css';

// Plural de cada tipo de entidad. Lo que no está aquí se muestra tal cual.
const PLURALES = {
  component: 'catalogo.tipos.component',
  api: 'catalogo.tipos.api',
  system: 'catalogo.tipos.system',
  domain: 'catalogo.tipos.domain',
  resource: 'catalogo.tipos.resource',
  group: 'catalogo.tipos.group',
  user: 'catalogo.tipos.user',
  template: 'catalogo.tipos.template',
  location: 'catalogo.tipos.location',
} as const;

// El portal no muestra equipos responsables: quien trabaja en cada proyecto
// se ve en su pestaña «Miembros», leída de GitHub.
const campoResponsable = CatalogTable.columns.createOwnerColumn().field;
const columnasSinResponsable: typeof CatalogTable.defaultColumnsFunc =
  contexto =>
    CatalogTable.defaultColumnsFunc(contexto).filter(
      c => c.field !== campoResponsable,
    );

/**
 * Tabla con el título en el idioma del portal. El de Backstage arma «All
 * Components (4)» con textos fijos en inglés que no pasan por la traducción.
 */
const TablaCatalogo = () => {
  const { t } = useTranslationRef(textosHrl);
  const { filters, totalItems } = useEntityList();
  const tipo = filters.kind?.value?.toLowerCase() ?? '';
  const clave = PLURALES[tipo as keyof typeof PLURALES];
  const plural = clave ? t(clave) : filters.kind?.label ?? tipo;
  const quien = filters.user?.value;
  let base: string = t('catalogo.tituloTodos', { tipo: plural });
  if (quien === 'owned') base = t('catalogo.tituloPropios', { tipo: plural });
  if (quien === 'starred') {
    base = t('catalogo.tituloFavoritos', { tipo: plural });
  }
  const cuenta = typeof totalItems === 'number' ? ` (${totalItems})` : '';
  return (
    <CatalogTable title={`${base}${cuenta}`} columns={columnasSinResponsable} />
  );
};

export const PaginaCatalogo = (props: { filtros: ReactNode }) => {
  const { t } = useTranslationRef(textosHrl);
  return (
    <EntityListProvider pagination>
      <Header
        title={t('catalogo.titulo')}
        description={t('catalogo.descripcion')}
        customActions={
          <ButtonLink href="/create" variant="primary" iconStart={<AddIcon />}>
            {t('catalogo.crear')}
          </ButtonLink>
        }
      />
      <Container className="hrl-catalogo">
        <CatalogFilterLayout>
          <CatalogFilterLayout.Filters>
            {props.filtros}
          </CatalogFilterLayout.Filters>
          <CatalogFilterLayout.Content>
            <TablaCatalogo />
          </CatalogFilterLayout.Content>
        </CatalogFilterLayout>
      </Container>
    </EntityListProvider>
  );
};
