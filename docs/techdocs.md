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

Markdown normal, en español, con tablas e imágenes (`docs/img/...`).

### Diagramas

Se dibujan en **draw.io** y se guardan como `.drawio.svg`: el archivo es una
imagen normal y a la vez guarda el diagrama editable, así que se vuelve a abrir
en draw.io (o en su extensión de VS Code) sin exportar nada. Se insertan como
cualquier imagen:

```markdown
![Qué muestra el diagrama](img/arquitectura.drawio.svg)
```

En el portal, un clic sobre la imagen la abre a pantalla completa, con zoom y
arrastre. Dale fondo blanco al diagrama para que se lea también en el tema oscuro.
Ejemplo: `docs/img/catalogo.drawio.svg` de este repo.

Los bloques ` ```mermaid ` **no se dibujan**: se ven como código. No se instalará
el plugin de Mermaid; usa draw.io.

## Cuándo aparece

El portal revisa la organización cada 30 minutos. La documentación se compila
la primera vez que alguien la abre, y se vuelve a compilar cuando cambia.

## Probar la documentación sin el portal

```powershell
npx @techdocs/cli serve   # necesita Docker; abre una vista previa local
```
