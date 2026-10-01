# Idioma del portal

El portal es **bilingüe**: español por defecto e inglés como alternativa. Cada
persona lo cambia en *Ajustes → Apariencia → Idioma*, y la elección se guarda en
sus preferencias.

## De dónde sale cada texto

| Texto | Dónde se traduce | ¿Cambia con el idioma? |
|---|---|---|
| Textos de los plugins de Backstage (catálogo, búsqueda, TechDocs, ajustes…) | `packages/app/translations/messages/<ref>.es.json` | Sí |
| Textos propios del portal (ingreso, barra lateral, bienvenida) | `packages/app/src/modules/idioma/textos.ts` | Sí |
| Títulos de página, migas de pan y pestañas | `app-config.yaml`, clave `title` de cada extensión | **No**: se ven siempre en español |
| Título de cada plugin (miga de pan sobre la ficha de una entidad, por ejemplo) | `packages/app/src/modules/idioma/plugins.ts` | **No**: siempre en español |
| Títulos de las tarjetas de la portada | `packages/app/src/modules/home/homeModule.tsx` | **No**: siempre en español |
| Contenido de la documentación (TechDocs) | El Markdown de cada repo | Se escribe solo en español |

Glosario que siguen todas las traducciones, para que un término no aparezca de
tres formas distintas:

| Inglés | Español |
|---|---|
| Entity | Entidad |
| Kind | Clase |
| Type | Tipo |
| Owner | Responsable |
| Lifecycle | Ciclo de vida |
| Starred | Favoritos |
| Template | Plantilla |
| Settings | Ajustes |
| Sign in / Sign out | Ingresar / Cerrar sesión |
| Docs / TechDocs | Documentación |

Tratamiento: de «tú».

## Al actualizar Backstage

Una versión nueva puede agregar o quitar textos. Desde `packages/app`:

```powershell
yarn traducciones:exportar     # reescribe los *.en.json con los textos actuales
yarn traducciones:comprobar    # dice qué claves faltan, sobran o tienen marcadores distintos
# traducir lo que falte en los *.es.json
yarn traducciones:importar     # regenera src/translations/resources.ts
```

`traducciones:comprobar` falla si falta una clave en español o si un marcador
(`{{count}}`, `{from}`…) no coincide con el original: i18next lo dejaría sin
sustituir y el usuario vería el texto crudo.

Si un plugin nuevo trae textos traducibles, `exportar` crea su `.en.json`;
`comprobar` avisará de que falta el `.es.json`.

## Lo que todavía se ve en inglés

- Las etiquetas «other» y «N times» de las tarjetas de visitas: textos fijos del
  plugin.
- El título de la tabla del catálogo («All Components»): se arma con los valores
  internos de los filtros (`all`, `Component`), no con textos traducibles.
  Cambiarlo exige reemplazar la tabla del catálogo.
- «Table of contents» dentro de TechDocs: lo pone el tema de MkDocs. Queda por
  probar si `theme.language: es` en el `mkdocs.yml` de cada repo lo resuelve.
- Los valores que vienen de los datos (clases como `Component`, tipos como
  `website`, ciclos como `experimental`): son identificadores del catálogo, no
  textos de interfaz.
- La tarjeta «Guest» del ingreso local, que en producción no existe.
