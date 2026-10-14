import { useApi } from '@backstage/frontend-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { Entidad, relaciones, tieneDocs } from '../comun/entidades';
import { useCarga } from '../comun/useCarga';
import { ordenarPorCapa } from '../comun/tecnologias';

export type Proyecto = {
  sistema: Entidad;
  componentes: number;
  apis: number;
  /** Componentes con TechDocs. */
  documentos: number;
  /** Etiquetas de sus componentes y APIs, sin repetir y ordenadas por capa. */
  tecnologias: string[];
};

export type ResumenCatalogo = {
  proyectos: Proyecto[];
  componentes: number;
  apis: number;
  personas: number;
};

const nombreSistema = (e: Entidad) => {
  const sistema = (e.spec as { system?: unknown } | undefined)?.system;
  return typeof sistema === 'string'
    ? sistema.split('/').pop()!.split(':').pop()!.toLowerCase()
    : undefined;
};

/**
 * Cada proyecto del portal es un System del catálogo. Se piden todos los
 * sistemas y, en una sola consulta, lo que cuelga de ellos para contarlo.
 */
export const useResumenCatalogo = () => {
  const catalogo = useApi(catalogApiRef);
  return useCarga<ResumenCatalogo>(async () => {
    const [sistemas, piezas, personas] = await Promise.all([
      catalogo.getEntities({
        filter: { kind: 'System' },
        order: { field: 'metadata.title', order: 'asc' },
      }),
      catalogo.getEntities({
        filter: { kind: ['Component', 'API'] },
        fields: [
          'kind',
          'spec.system',
          'metadata.name',
          'metadata.annotations',
          'metadata.tags',
        ],
      }),
      catalogo.getEntities({
        filter: { kind: 'User' },
        fields: ['metadata.name'],
      }),
    ]);

    const proyectos = sistemas.items.map(sistema => {
      const propias = piezas.items.filter(
        p => nombreSistema(p) === sistema.metadata.name.toLowerCase(),
      );
      return {
        sistema,
        componentes: propias.filter(p => p.kind === 'Component').length,
        apis: propias.filter(p => p.kind === 'API').length,
        documentos: propias.filter(tieneDocs).length,
        tecnologias: ordenarPorCapa(
          propias.flatMap(p => p.metadata.tags ?? []),
        ),
      };
    });

    return {
      proyectos,
      // Solo lo que cuelga de un proyecto publicado: un componente cuyo sistema
      // no está en catalog/hrl.yaml no se cuenta.
      componentes: proyectos.reduce((n, p) => n + p.componentes, 0),
      apis: proyectos.reduce((n, p) => n + p.apis, 0),
      personas: personas.items.length,
    };
  }, [catalogo]);
};

/** Un proyecto con todo lo que cuelga de él y su equipo responsable. */
export type DetalleProyecto = {
  sistema: Entidad;
  componentes: Entidad[];
  apis: Entidad[];
  recursos: Entidad[];
  responsable?: Entidad;
  miembros: Entidad[];
  dominio?: Entidad;
};

export const useDetalleProyecto = (nombre: string) => {
  const catalogo = useApi(catalogApiRef);
  return useCarga<DetalleProyecto | undefined>(async () => {
    const sistema = await catalogo.getEntityByRef({
      kind: 'System',
      namespace: 'default',
      name: nombre,
    });
    if (!sistema) return undefined;

    const refSistema = `system:default/${sistema.metadata.name}`.toLowerCase();
    const [piezas, responsables, dominios] = await Promise.all([
      catalogo.getEntities({
        filter: {
          kind: ['Component', 'API', 'Resource'],
          'relations.partOf': refSistema,
        },
        order: { field: 'metadata.name', order: 'asc' },
      }),
      catalogo.getEntitiesByRefs({
        entityRefs: relaciones(sistema, 'ownedBy'),
      }),
      catalogo.getEntitiesByRefs({
        entityRefs: relaciones(sistema, 'partOf'),
      }),
    ]);

    const responsable = responsables.items.find(Boolean);
    const miembros = responsable
      ? (
          await catalogo.getEntitiesByRefs({
            entityRefs: relaciones(responsable, 'hasMember'),
          })
        ).items.filter((m): m is Entidad => Boolean(m))
      : [];

    return {
      sistema,
      componentes: piezas.items.filter(p => p.kind === 'Component'),
      apis: piezas.items.filter(p => p.kind === 'API'),
      recursos: piezas.items.filter(p => p.kind === 'Resource'),
      responsable,
      miembros,
      dominio: dominios.items.find(d => d?.kind === 'Domain'),
    };
  }, [catalogo, nombre]);
};
