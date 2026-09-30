# Documentar un repo con TechDocs

Para que un repo de `DevHRL` aparezca en el portal con su documentación hacen
falta tres archivos en su raíz.

## 1. `catalog-info.yaml`

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: oncologia-frontend
  title: Frontend de Vigilancia Oncológica
  annotations:
    github.com/project-slug: DevHRL/HIS_HRL
    backstage.io/techdocs-ref: dir:.
spec:
  type: website
  owner: equipo-oncologia
  system: vigilancia-oncologica
  lifecycle: production
```

- `system` debe ser uno de los definidos en `catalog/hrl.yaml` del portal.
- `backstage.io/techdocs-ref: dir:.` indica que `mkdocs.yml` está junto a este
  archivo.

## 2. `mkdocs.yml`

```yaml
site_name: Vigilancia Oncológica
nav:
  - Inicio: index.md
plugins:
  - techdocs-core
```

## 3. `docs/index.md`

Markdown normal, con tablas e imágenes (`docs/img/...`). Los diagramas de
draw.io se guardan como `.drawio.svg` y se insertan como imagen.

Los bloques ` ```mermaid ` todavía se muestran como código: TechDocs necesita
un addon en el frontend del portal para dibujarlos, y aún no está instalado.
Se pueden escribir desde ya; se verán como diagrama cuando se instale.

## Cuándo aparece

El portal revisa la organización cada 30 minutos. La documentación se compila
la primera vez que alguien la abre, y se vuelve a compilar cuando cambia.

## Probar la documentación sin el portal

```powershell
npx @techdocs/cli serve   # necesita Docker; abre una vista previa local
```
