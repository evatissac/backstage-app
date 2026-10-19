# ${{ values.titulo }}

${{ values.descripcion }}

La documentación completa (situación, proceso, arquitectura, tecnologías y
decisiones) está en [`docs/`](docs/index.md) y se publica en el Portal de
Desarrollo HRL, en la pestaña **Docs** de este proyecto.

## Cómo documentar

- Escribe en los archivos de `docs/` con Markdown normal. Cada página del portal
  tiene un botón para editarla aquí en GitHub.
- Diagramas: guárdalos en draw.io como `.drawio.svg` dentro de `docs/proceso/`
  y enlázalos como imagen. Ver [`docs/proceso/index.md`](docs/proceso/index.md).
- Nada con datos de pacientes en este repo ni en la documentación.
- Para agregar una página nueva, créala en `docs/` y añádela a `nav` en `mkdocs.yml`.
