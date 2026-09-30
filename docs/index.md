# Portal de Desarrollo HRL

Portal interno del Hospital Regional de Loreto construido con
[Backstage](https://backstage.io). Reúne en un solo lugar:

- **Catálogo**: sistemas, componentes, APIs, recursos y equipos responsables.
- **Documentación (TechDocs)**: el Markdown de la carpeta `docs/` de cada repo,
  publicado dentro del portal.
- **Búsqueda**: sobre el catálogo y la documentación.

## Cómo se organiza el catálogo

```mermaid
flowchart TD
  D[Dominio: Sistemas del HRL] --> S1[Sistema: Vigilancia Oncológica]
  D --> S2[Sistema: Reporte Estadístico]
  D --> S3[Sistema: Plataforma HRL]
  S1 --> C1[Componentes del repo HIS_HRL]
  S2 --> C2[Componentes del repo Estadistica_hrl]
  S3 --> C3[hrl-core-ui, este portal]
```

| Qué | Dónde se declara |
|---|---|
| Dominio, sistemas y equipos | `catalog/hrl.yaml` de este repo |
| Componentes, APIs y recursos | `catalog-info.yaml` en la raíz de cada repo de `DevHRL` |
| Documentación | `mkdocs.yml` y `docs/` de cada repo |

El portal revisa la organización `DevHRL` cada 30 minutos y registra solo los
repos que tengan `catalog-info.yaml`. Un proyecto nuevo aparece sin tocar la
configuración del portal.

## Páginas

- [Estado y pendientes](estado-y-pendientes.md): qué existe, qué se decidió y qué falta
- [Levantamiento local](levantamiento.md)
- [Documentar un repo con TechDocs](techdocs.md)
- [Migración a VPS](despliegue-vps.md)
