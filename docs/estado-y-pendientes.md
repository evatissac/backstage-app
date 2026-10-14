# Estado y pendientes

**Última actualización:** 2026-10-14. Léelo completo antes de tocar nada: explica
qué existe, qué se decidió, qué **no** se debe hacer todavía y qué sigue.

## 1. Resumen en 30 segundos

- Se está montando un portal **Backstage** para documentar y catalogar los sistemas
  del Hospital Regional de Loreto. Responsable: Andre.
- El portal **funciona en local** (login con GitHub, catálogo, TechDocs, bilingüe
  español/inglés, Postgres en Docker). Está en `DevHRL/hrl-backstage` (privado).
- Los repos del hospital se están moviendo a la organización de GitHub **`DevHRL`**.
- **Fase A terminada** (plantilla limpia, base de datos, idioma, diagramas). Sigue
  la fase B: personalización visual y subportales por proyecto.
- **Solo en local por ahora.** El 2026-10-01 se probó un despliegue provisional
  (Coolify en WSL2 + túnel gratuito de Cloudflare) y el 2026-10-02 se **desmontó**:
  la dirección del túnel cambiaba con cada reinicio y el hospital confirmó que
  dará un **servidor en unos días**. El procedimiento probado queda en
  [Coolify: paso a paso](coolify-paso-a-paso.md) para repetirlo allí.
- **Aún no se documenta ningún repo** ni se crean equipos. Ver sección 4.

## 2. Qué existe hoy

### Repos y su ubicación

| Proyecto                        | Repo actual              | Situación                                                                                   |
| ------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------- |
| Portal Backstage                | `DevHRL/hrl-backstage`   | Creado. Carpeta local: `Desktop\hrl-backstage`                                              |
| Kit de UI `hrl-core-ui`         | `DevHRL/hrl-core-ui`     | **Transferido** desde `GiancarloChavez` (el nombre antiguo redirige)                        |
| Reporte Estadístico y Nutrición | `DevHRL/Estadistica_hrl` | **Transferido** desde `evatissac`. Ramas `main`, `prototype`, `feature/backend-nucleo`      |
| Oncología                       | `DevHRL/HIS_HRL`         | **Espejo**, no transferencia. El original `evatissac/HIS_HRL` sigue desplegado desde `main` |
| `SIGH-FRONTEND`, `SIGH-BACKEND` | `DevHRL`                 | Ya estaban en la organización; no se han revisado                                           |

RotaPass y RotaPass-Admin **no forman parte** del hospital ni de este portal.

Detalles que importan:

- **Oncología:** el espejo tiene las 11 ramas idénticas al original. Solo se cambió
  la URL del kit en `UI_standard` y `ficha14`. `main` (la desplegada) **no usa el
  kit** y no se tocó. El original **sigue recibiendo pushes** (por ejemplo `ficha14`).
  Las carpetas locales de Oncología aún apuntan a `evatissac/HIS_HRL`, a propósito.
- **El kit:** los proyectos lo instalan con una URL fijada a un tag. Se cambió la
  URL a `DevHRL/hrl-core-ui` en Estadística (`main`, `feature/backend-nucleo`) y en
  el espejo de Oncología. La URL vieja sigue funcionando por redirección.
- **Organización `DevHRL`:** el 2FA obligatorio está **desactivado** y los miembros
  pueden crear repos. El importador trae **9 miembros**. **No tiene equipos de GitHub.**

### El portal

| Pieza                        | Estado                                                                                                                                                                                                                                                                                                                      |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Login con GitHub             | ✅ Solo entran los miembros de `DevHRL` (el usuario debe existir en el catálogo)                                                                                                                                                                                                                                            |
| Ingreso como invitado        | ✅ Solo en local: la página de ingreso no lo muestra fuera de desarrollo y el backend lo rechaza                                                                                                                                                                                                                            |
| Catálogo                     | ✅ Dominio `salud-hrl` y **un solo proyecto publicado**, `reporte-estadistico` (2026-10-14, a pedido del usuario: los demás se agregan cuando estén listos). En `catalog/hrl.yaml`. El componente del portal (`hrl-backstage`) sigue apuntando a `plataforma-hrl`, que ya no existe: no cuenta en proyectos ni en calidad   |
| Descubrimiento de repos      | ✅ Cada 30 min busca `catalog-info.yaml` en la raíz de cada repo de `DevHRL`. Hoy solo el portal lo tiene                                                                                                                                                                                                                   |
| Importación de miembros      | ✅ Cada 60 min. Trae 9 usuarios con usuario, nombre y avatar. Sin correo                                                                                                                                                                                                                                                    |
| Equipos (Groups)             | ⚠️ Los 3 de `catalog/hrl.yaml` existen pero **sin miembros** (ver sección 4)                                                                                                                                                                                                                                                |
| Base de datos                | ✅ PostgreSQL 18 de Windows (`127.0.0.1:5432`, rol `backstage`); `iniciar.ps1` comprueba que responda. Sesiones y preferencias ya no se pierden                                                                                                                                                                             |
| Búsqueda                     | ✅ Motor de Postgres (antes, índice en memoria)                                                                                                                                                                                                                                                                             |
| Idioma                       | ✅ Español por defecto e inglés en _Ajustes_. ~800 textos traducidos con glosario. Quedan huecos conocidos: ver [Idioma](idioma.md)                                                                                                                                                                                         |
| TechDocs                     | ✅ Compila en local con Docker. Mermaid **no** se dibuja (decisión: draw.io)                                                                                                                                                                                                                                                |
| Diagramas y zoom             | ✅ Probado con un `.drawio.svg` real: el LightBox lo abre y amplía con la rueda. Ejemplo en `docs/img/catalogo.drawio.svg`                                                                                                                                                                                                  |
| Portada                      | ✅ Propia, en Backstage UI (`modules/home`): héroe con saludo, búsqueda y cifras; accesos, proyectos, favoritos y visitas. Es la página `/`                                                                                                                                                                                 |
| Plantillas (caminos dorados) | ✅ Dos en `plantillas/`: _Nuevo repositorio HRL_ (crea el repo en DevHRL, registrado y documentado) y _Documentar un repositorio existente_ (abre un PR). **Ninguna se ejecutó de verdad**: el ensayo (dry-run) del scaffolder falla en Windows por un error de rutas de Backstage (`C:\C:\…`); probar en el servidor Linux |
| Calidad                      | ✅ `/calidad`, pestaña _Calidad_ en cada componente/API y en cada proyecto: niveles Bronce, Plata y Oro calculados con el catálogo (`modules/calidad/reglas.ts`). No lee el contenido de los repos                                                                                                                          |
| Primeros pasos               | ✅ Lista en la portada que se marca sola (visitas y favoritos) y guía en `/primeros-pasos`                                                                                                                                                                                                                                  |
| Kubernetes                   | ✅ Quitado                                                                                                                                                                                                                                                                                                                  |
| Permisos                     | ⚠️ «Permitir todo»                                                                                                                                                                                                                                                                                                          |
| Logo y colores               | ⚠️ Paleta verde agua (`modules/tema/paleta.ts` y `tokens.css`). Sin logo: un sello «HRL» ocupa su lugar hasta que llegue (`modules/nav/Marca.tsx`)                                                                                                                                                                          |

## 3. Cómo retomar el trabajo

```powershell
cd C:\Users\Andre\Desktop\hrl-backstage
.\iniciar.ps1          # comprueba Postgres y levanta el portal: http://localhost:3000 (frontend), :7007 (backend)
```

Requisitos: el **servicio `postgresql-x64-18`** en marcha con el rol `backstage`
(el script se detiene si la base no responde), **Docker Desktop** para compilar
TechDocs, `.env` con las credenciales (copia de `.env.example`) y Yarn activado
con Corepack. Detalle en
[Levantamiento local](levantamiento.md).

Cosas que ya dieron problemas:

- **`yarn install` falla con `got-npm-11.8.2...patch`**: error de publicación de
  `@yarnpkg/core`. Ya está corregido con una resolución en `package.json`.
- **Un arranque con «IPC request timed out»**: varios plugins fallaron una vez.
  Reiniciar el portal lo resolvió; si se repite, investigar.
- **Ver la página de ingreso**: si el navegador ya tiene sesión de invitado no
  aparece. Usar ventana privada o cerrar sesión en _Ajustes_.
- **Token de GitHub**: el importador de miembros necesita los permisos `repo`,
  `read:org`, `read:user` y `user:email`. Con menos, falla al leer el correo.
- **Capturas de pantalla**: hay Edge instalado; Playwright puede usarlo con
  `channel: 'msedge'` sin descargar nada.
- **Crear una OAuth App**: cada una admite una sola URL de callback, por eso
  cada dirección del portal necesita la suya (o una GitHub App).
- **La documentación del propio portal se compila desde GitHub** (`main` de
  `DevHRL/hrl-backstage`), no desde la copia local: un cambio en `docs/` no se ve
  en el portal hasta que se sube. Para probar en local, registrar una entidad
  temporal con `app-config.local.yaml` (git lo ignora) y **reiniciar** el portal:
  un archivo de configuración nuevo no se detecta en caliente.
- **`app-config.local.yaml` reemplaza listas, no las suma**: si define
  `catalog.locations`, las de `app-config.yaml` (incluidas las plantillas) dejan
  de cargarse. Repetirlas allí.
- **El backend no arranca y el log dice «la autentificación password falló para
  el usuario backstage»** (2026-10-13): la contraseña del rol en el Postgres de
  Windows no coincide con `.env`. Arreglo, como `postgres`:
  `ALTER ROLE backstage PASSWORD '<POSTGRES_PASSWORD de .env>'`. Mientras tanto
  sirve el Postgres de Docker (`docker compose up -d --wait`, puerto 5433).
- **Añadir una dependencia al frontend**: declarar la versión que ya está en
  `yarn.lock` y revisar que el diff del lockfile no suba versiones.

## 4. Decisiones tomadas

| Decisión                                            | Detalle                                                                                                                                                                                                                             |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Backstage**, no BookStack ni otros                | Equipo de ~30 personas; se aceptó el costo de mantenerlo.                                                                                                                                                                           |
| **Login con GitHub**                                | La organización `DevHRL` es la fuente de usuarios.                                                                                                                                                                                  |
| **Todo gratuito**                                   | Alojamiento, dominio, base de datos y respaldos.                                                                                                                                                                                    |
| **Alojamiento: servidor del hospital con Coolify**  | El hospital lo dará en unos días. Mientras tanto, solo local. Se probó y desmontó Coolify en el PC de Andre; Oracle Always Free, las nubes con capa gratis y los dominios de pago se descartaron (ver [Despliegue](despliegue.md)). |
| **Una sola instancia con subportales por proyecto** | Los proyectos comparten base de datos. Cada proyecto es un `System`, con su ruta (`/proyectos/<proyecto>`) y una cabecera que deja claro en qué proyecto se está. Nada se registra sin `spec.system`.                               |
| **PostgreSQL 18 en todas partes**                   | En local, el Postgres de Windows; en Coolify, `postgres:18-alpine`. No se cambia de versión al migrar. Se descartó SQLite en archivo.                                                                                               |
| **Bilingüe: español por defecto, inglés opcional**  | Con las herramientas oficiales de Backstage (`translations export/import`) y un glosario fijo. La documentación de los repos, solo en español.                                                                                      |
| **Diagramas: draw.io como `.drawio.svg`**           | Con el addon LightBox para zoom y arrastre. **No instalar el plugin de Mermaid** salvo que no haya mejor alternativa.                                                                                                               |
| **RotaPass fuera**                                  | Es un proyecto aislado: no entra en `DevHRL` ni en el portal.                                                                                                                                                                       |
| **Commits del repo del portal**                     | A nombre de Andre (`Andre-pezo@outlook.es`), **sin** línea `Co-Authored-By` de Claude.                                                                                                                                              |
| **Empezar con el portal estándar**                  | Se personaliza poco a poco; no se hace fork de Backstage.                                                                                                                                                                           |

### Cosas que el usuario pidió NO hacer todavía

- **No documentar ningún repo** (ni `catalog-info.yaml`, ni `mkdocs.yml`, ni `docs/`).
- **No crear equipos** en GitHub ni asignar miembros a los del catálogo.
- **Desplegar** hasta que esté el servidor del hospital.

## 5. Decisiones abiertas

1. **Servidor del hospital:** sistema operativo, RAM y disco; si TI permite instalar
   Coolify; si tendrá IP pública o solo red interna.
2. **Dirección fija:** un subdominio del dominio del hospital (lo da TI, gratis) o
   `.eu.org` (gratis, aprobación de hasta un mes). Sin gastar dinero.
3. **Oncología:** fecha de corte para dejar de usar `evatissac/HIS_HRL` y desplegar
   desde `DevHRL/HIS_HRL`. Al cortar: resincronizar lo que entró al original, recrear
   los 5 issues abiertos, secretos y webhooks, y cambiar el origen del despliegue.
4. **Nombre del espejo de Oncología:** hoy `HIS_HRL` (igual que el original).
   Renombrar cuando convenga; GitHub redirige.
5. **Proyectos del portal:** ¿Nutrición es un proyecto propio o parte de
   Estadística (comparten repo)? ¿Entra SIGH?

## 6. Pendientes, en orden sugerido

### A. Preparar el portal — ✅ terminada

- [x] Base de datos local: Postgres 18 de Windows (antes, 17 en Docker).
- [x] Limpiar la plantilla: portada, Kubernetes, plantilla de ejemplo y `examples/`.
- [x] Idioma bilingüe, con comprobación automática de claves y marcadores.
- [x] Probar el LightBox con un `.drawio.svg` real.

### B. Personalización y subportales

- [x] Rediseño al estilo de Portal de Spotify (2026-10-13), con paleta verde agua:
      tema (`modules/tema`: `paleta.ts` para Material UI, `tokens.css` para BUI;
      cambiar uno exige cambiar el otro), marco y barra lateral propios
      (`modules/nav`, reemplazan `app/layout`; plegable, cajón en móvil, búsqueda
      con Ctrl K), portada (`modules/home`), página de ingreso (`modules/signIn`)
      y subportales (`modules/proyectos`). Cabeceras de tabla y panel de filtros
      del catálogo corregidos en el tema. Revisado en Edge (Playwright), claro y
      oscuro, escritorio y móvil.
- [x] Caminos dorados, calidad y primeros pasos (2026-10-13). Ver la tabla de la
      sección 2.
- [x] **Ficha técnica del proyecto** (2026-10-14): pestañas _Arquitectura,
      Tecnologías, Despliegue, Procesos y Documentos_, con cuatro diagramas
      hechos con archify (arquitectura, despliegue, ciclo mensual, estados).
      Lo que falta (respaldos, acceso, URL de producción, Drive y enlaces de
      documentos) se muestra como pendiente. Cómo completarlo y regenerar los
      diagramas: [Qué debe mostrar el portal](contenido-del-portal.md), §8.
- [x] Página del catálogo propia (`modules/catalogo`) para traducir el título de
      la tabla («Componentes (4)»); conserva los filtros del catálogo.
- [ ] Logo y favicon (el título ya es «Portal de Desarrollo HRL»). El logo va en
      `.hrl-marca__sello` (`modules/nav/Marca.tsx`) y en `.hrl-ingreso__sello`.
- [x] Portada propia.
- [x] **Subportales por proyecto**: `/proyectos` con una tarjeta por sistema y
      `/proyectos/<proyecto>` con pestañas _Resumen · Componentes · Documentación ·
      APIs · Equipo_. El color de cada proyecto sale de la anotación `hrl/color`
      del sistema (`catalog/hrl.yaml`). Selector de proyecto en la barra lateral.
- [x] Cabecera propia en la ficha de entidad (`modules/entidad`,
      `EntityHeaderLayoutBlueprint`): franja con el proyecto y su color, nivel de
      calidad, favorito y menú (inspeccionar, copiar enlace, dar de baja). Los
      elementos de menú que agreguen otros plugins **no** aparecen en este menú.
- [ ] Ejecutar de verdad las dos plantillas en el servidor (crea un repo y abre
      un PR en DevHRL: pedir confirmación antes).
- [ ] Addon de TechDocs que muestre el proyecto en la cabecera de cada documento.
- [ ] Búsqueda filtrada por proyecto (comprobar si el índice de TechDocs incluye
      el sistema; si no, añadirlo al indexar).
- [ ] Regla en el backend que rechace entidades sin `spec.system`.
- [ ] Probar `theme.language: es` en `mkdocs.yml` para traducir «Table of contents».

### B2. Rediseño inspirado en Port (2026-10-14, sin subir)

Se estudió la demo pública de Port (demo.port.io) con el skill REA y se tomó
su idea central: todo se arma con cuatro piezas (entidad, tabla, widget y
acción). Repo oficial ahora: `evatissac/backstage-app` (**público**); la rama
`backstage-1phase` tiene el estado anterior al rediseño. El rediseño está en
local: el usuario indicará en qué rama subirlo.

- [x] **Piezas comunes** (`modules/comun`): `TablaHRL` (búsqueda, filtros por
      columna, columnas ocultables, agrupar, exportar CSV y contador; la vista
      se guarda en las preferencias del usuario), `Etiqueta` (chip con tono e
      icono), `Cifra` (cifra con su explicación; «Sin datos» si no hay nada
      que medir) y `Migas`.
- [x] **Ficha del proyecto: de 11 a 6 pestañas.** _Ficha técnica_ agrupa
      Arquitectura, Tecnologías, Despliegue y Procesos como subnavegación;
      _Componentes y APIs_ incluye recursos; _Documentación_ junta TechDocs y
      documentos. Las rutas antiguas redirigen.
- [x] **Barra lateral por áreas:** Explorar (Proyectos, Catálogo,
      Documentación, Mapa) · Acciones (Autoservicio) · Estándares (Calidad).
      Fuera del menú: Primeros pasos, Crear, el grafo genérico y el
      visualizador. **Registro manual desactivado** (`page:catalog-import`).
- [x] **Autoservicio** (`/autoservicio`, `modules/autoservicio`): plantillas
      como acciones, agrupadas por `spec.type`. Cada plantilla se presenta con
      anotaciones: `hrl/verbo` (texto del botón), `hrl/aplica-a` (clases en
      cuya ficha aparece como ⚡) y `hrl/prellenar` (campos que llegan
      completos). Las dos plantillas aplican a `system`.
- [x] **Ficha de entidad:** botón ⚡ en la cabecera; tarjetas _Contexto_
      (reemplaza a «Acerca de»), _Acciones_ y _Comprobaciones_
      (`modules/entidad/Tarjetas.tsx`).
- [x] **Portada:** héroe compacto, fila de cifras, «Pendiente para ti» (lo de
      tus equipos que no llega a Oro) y accesos con Autoservicio.
- [x] **Calidad en el servidor con Tech Insights** (`@backstage-community`,
      backend 3.1.0 + jsonfc 0.10.0; `backend-defaults` fijado a la 0.18 con
      una resolución). Datos en `packages/backend/src/modules/calidad.ts`
      (`hrlCatalogo` cada 30 min, `hrlRepositorio` cada 6 h: README,
      CODEOWNERS, credenciales versionadas, kit fijado a un tag); 13 reglas en
      `techInsights` de `app-config.yaml`. Una regla sin datos se muestra
      «Sin evaluar», nunca como fallida. `/calidad` tiene vistas _Por
      componente_ y _Por comprobación_.
- [x] **Mapa** (`/mapa`): grafo desde el dominio `salud-hrl` (con equipos
      opcionales) y vista de tarjetas con cuántas entidades hay de cada clase.
- [x] **Recurso** `bd-reporte-estadistico` en `catalog/hrl.yaml` (y `Resource`
      permitido en esa ubicación).
- [ ] Acciones del día a día que abren issues: **el usuario pidió no
      integrarlas todavía**.
- [ ] Ordenar las tarjetas del resumen: _Comprobaciones_ sale al final porque
      Backstage las ordena por registro.
- [ ] Probar el ⚡ de punta a punta: el formulario se abre prellenado, pero la
      plantilla sigue sin ejecutarse de verdad (ver arriba).

### C. Catálogo (cuando el usuario lo autorice)

- [ ] Equipos de GitHub → grupos con personas. Luego borrar los tres de
      `catalog/hrl.yaml` y apuntar los sistemas a los de GitHub.
- [ ] `catalog-info.yaml`, `mkdocs.yml` y `docs/` en cada repo de `DevHRL`,
      empezando por Oncología, que está en reingeniería. Plantilla en
      [Documentar un repo](techdocs.md).
- [ ] Repo plantilla `hrl-template` con esos archivos y un `CODEOWNERS`, para que los
      proyectos nuevos nazcan conformes.
- [ ] Averiguar por qué `SIGH-BACKEND` no aparece (¿vacío? ¿rama por defecto distinta
      de `main`?) y revisar `SIGH-FRONTEND`.
- [ ] Definir dónde viven los Excel, escaneados y actas, con una regla explícita:
      **nada con datos de pacientes en el portal ni en los repos**.

### D. Kit y repos migrados

- [ ] Cambiar la URL antigua en el propio repo `hrl-core-ui` (`bin/lib/init.mjs`,
      `doctor.mjs`, `upgrade.mjs`, `package.json`, `README.md`, `MIGRACION.md`,
      `scripts/humo-cli.mjs`) y publicar una versión nueva (p. ej. v1.7.2).
      **No publicar un tag sin confirmación del usuario.**
- [ ] Actualizar los remotos locales de Oncología cuando se corte.
- [ ] Activar el 2FA obligatorio en `DevHRL` y decidir quién puede crear repos.
- [ ] Ejecutar `npm install` con la URL nueva en los proyectos migrados: **no se
      probó**, solo se confía en la redirección de GitHub.

### E. Despliegue en el servidor del hospital (cuando llegue)

Repetir [Coolify: paso a paso](coolify-paso-a-paso.md) en el servidor:
Coolify → deploy key → OAuth App de la dirección definitiva → Postgres →
aplicación → **respaldos a Cloudflare R2, probados** → pruebas. El Dockerfile y
`app-config.production.yaml` ya están listos y probados.

Antes de volver a desplegar:

- Pasar la rama `despliegue-coolify` a `main`.
- Volver a agregar la deploy key: la del montaje de prueba se borró.
- Crear una OAuth App nueva para la dirección del servidor.

### F. Seguridad

- [ ] **URGENTE (2026-10-14):** pendiente de seguridad en el repo de
      Estadística. El detalle está en `notas-seguridad.privado.md` (local, no
      versionado: este repositorio es público).
- [ ] Reemplazar el token personal por una GitHub App de la organización (también
      resuelve las callbacks de varias direcciones).
- [ ] Política de permisos distinta de «permitir todo» antes de abrir a los 30.

## 7. Dónde está cada cosa

| Qué                           | Dónde                                                                |
| ----------------------------- | -------------------------------------------------------------------- |
| Configuración del portal      | `app-config.yaml` (local), `app-config.production.yaml` (despliegue) |
| Base de datos local           | `compose.yaml`                                                       |
| Backend (plugins)             | `packages/backend/src/index.ts`                                      |
| Frontend (extensiones)        | `packages/app/src/App.tsx` y `packages/app/src/modules/`             |
| Página de ingreso             | `packages/app/src/modules/signIn/index.tsx`                          |
| Marco y barra lateral         | `packages/app/src/modules/nav/` (`Marco.tsx`, `BarraLateral.tsx`)    |
| Textos propios y traducciones | `packages/app/src/modules/idioma/` y `packages/app/translations/`    |
| Dominio, sistemas y equipos   | `catalog/hrl.yaml`                                                   |
| Plantillas (caminos dorados)  | `plantillas/` (registradas en `app-config*.yaml`)                    |
| Reglas de calidad             | `packages/app/src/modules/calidad/reglas.ts`                         |
| Arranque local                | `iniciar.ps1` y `.env` (no versionado; ver `.env.example`)           |
| Plan de despliegue            | `docs/despliegue.md`                                                 |
| Idioma                        | `docs/idioma.md`                                                     |
| Este documento                | `docs/estado-y-pendientes.md`                                        |
