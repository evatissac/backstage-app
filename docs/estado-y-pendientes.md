# Estado y pendientes

**Última actualización:** 2026-09-30. Léelo completo antes de tocar nada: explica
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

| Proyecto | Repo actual | Situación |
|---|---|---|
| Portal Backstage | `DevHRL/hrl-backstage` | Creado. Carpeta local: `Desktop\hrl-backstage` |
| Kit de UI `hrl-core-ui` | `DevHRL/hrl-core-ui` | **Transferido** desde `GiancarloChavez` (el nombre antiguo redirige) |
| Reporte Estadístico y Nutrición | `DevHRL/Estadistica_hrl` | **Transferido** desde `evatissac`. Ramas `main`, `prototype`, `feature/backend-nucleo` |
| Oncología | `DevHRL/HIS_HRL` | **Espejo**, no transferencia. El original `evatissac/HIS_HRL` sigue desplegado desde `main` |
| `SIGH-FRONTEND`, `SIGH-BACKEND` | `DevHRL` | Ya estaban en la organización; no se han revisado |

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

| Pieza | Estado |
|---|---|
| Login con GitHub | ✅ Solo entran los miembros de `DevHRL` (el usuario debe existir en el catálogo) |
| Ingreso como invitado | ✅ Solo en local: la página de ingreso no lo muestra fuera de desarrollo y el backend lo rechaza |
| Catálogo | ✅ Dominio `salud-hrl`, 3 sistemas (`vigilancia-oncologica`, `reporte-estadistico`, `plataforma-hrl`), definidos en `catalog/hrl.yaml` |
| Descubrimiento de repos | ✅ Cada 30 min busca `catalog-info.yaml` en la raíz de cada repo de `DevHRL`. Hoy solo el portal lo tiene |
| Importación de miembros | ✅ Cada 60 min. Trae 9 usuarios con usuario, nombre y avatar. Sin correo |
| Equipos (Groups) | ⚠️ Los 3 de `catalog/hrl.yaml` existen pero **sin miembros** (ver sección 4) |
| Base de datos | ✅ PostgreSQL 17 en Docker (`compose.yaml`, `127.0.0.1:5433`); la levanta `iniciar.ps1`. Sesiones y preferencias ya no se pierden |
| Búsqueda | ✅ Motor de Postgres (antes, índice en memoria) |
| Idioma | ✅ Español por defecto e inglés en *Ajustes*. ~800 textos traducidos con glosario. Quedan huecos conocidos: ver [Idioma](idioma.md) |
| TechDocs | ✅ Compila en local con Docker. Mermaid **no** se dibuja (decisión: draw.io) |
| Diagramas y zoom | ✅ Probado con un `.drawio.svg` real: el LightBox lo abre y amplía con la rueda. Ejemplo en `docs/img/catalogo.drawio.svg` |
| Portada | ✅ Sin chistes, relojes ni enlaces a backstage.io. Tarjeta de bienvenida, favoritos y visitas. La portada propia llega en la fase B |
| Plantilla de ejemplo | ✅ Quitada, con la carpeta `examples/`. El Scaffolder sigue instalado, sin plantillas |
| Kubernetes | ✅ Quitado |
| Permisos | ⚠️ «Permitir todo» |
| Logo y colores | ⚠️ Los de Backstage (fase B) |

## 3. Cómo retomar el trabajo

```powershell
cd C:\Users\Andre\Desktop\hrl-backstage
.\iniciar.ps1          # levanta Postgres y el portal: http://localhost:3000 (frontend), :7007 (backend)
```

Requisitos: **Docker Desktop encendido** (ahora es obligatorio: ahí vive la base;
el script se detiene si está apagado), `.env` con las credenciales (copia de
`.env.example`) y Yarn activado con Corepack. Detalle en
[Levantamiento local](levantamiento.md).

Cosas que ya dieron problemas:

- **`yarn install` falla con `got-npm-11.8.2...patch`**: error de publicación de
  `@yarnpkg/core`. Ya está corregido con una resolución en `package.json`.
- **Un arranque con «IPC request timed out»**: varios plugins fallaron una vez.
  Reiniciar el portal lo resolvió; si se repite, investigar.
- **Ver la página de ingreso**: si el navegador ya tiene sesión de invitado no
  aparece. Usar ventana privada o cerrar sesión en *Ajustes*.
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
- **Añadir una dependencia al frontend**: declarar la versión que ya está en
  `yarn.lock` y revisar que el diff del lockfile no suba versiones.

## 4. Decisiones tomadas

| Decisión | Detalle |
|---|---|
| **Backstage**, no BookStack ni otros | Equipo de ~30 personas; se aceptó el costo de mantenerlo. |
| **Login con GitHub** | La organización `DevHRL` es la fuente de usuarios. |
| **Todo gratuito** | Alojamiento, dominio, base de datos y respaldos. |
| **Alojamiento: servidor del hospital con Coolify** | El hospital lo dará en unos días. Mientras tanto, solo local. Se probó y desmontó Coolify en el PC de Andre; Oracle Always Free, las nubes con capa gratis y los dominios de pago se descartaron (ver [Despliegue](despliegue.md)). |
| **Una sola instancia con subportales por proyecto** | Los proyectos comparten base de datos. Cada proyecto es un `System`, con su ruta (`/proyectos/<proyecto>`) y una cabecera que deja claro en qué proyecto se está. Nada se registra sin `spec.system`. |
| **PostgreSQL 17 en todas partes** | También en local (Docker, puerto 5433): no se cambia de base al migrar. Se descartó SQLite en archivo. |
| **Bilingüe: español por defecto, inglés opcional** | Con las herramientas oficiales de Backstage (`translations export/import`) y un glosario fijo. La documentación de los repos, solo en español. |
| **Diagramas: draw.io como `.drawio.svg`** | Con el addon LightBox para zoom y arrastre. **No instalar el plugin de Mermaid** salvo que no haya mejor alternativa. |
| **RotaPass fuera** | Es un proyecto aislado: no entra en `DevHRL` ni en el portal. |
| **Commits del repo del portal** | A nombre de Andre (`Andre-pezo@outlook.es`), **sin** línea `Co-Authored-By` de Claude. |
| **Empezar con el portal estándar** | Se personaliza poco a poco; no se hace fork de Backstage. |

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

- [x] Base de datos local: Postgres 17 en Docker.
- [x] Limpiar la plantilla: portada, Kubernetes, plantilla de ejemplo y `examples/`.
- [x] Idioma bilingüe, con comprobación automática de claves y marcadores.
- [x] Probar el LightBox con un `.drawio.svg` real.

### B. Personalización y subportales

- [ ] Tema con colores y fuentes de `hrl-core-ui`, y revisar el modo oscuro.
- [ ] Logo, favicon y título (hoy dice «Backstage» en la barra lateral).
- [ ] Portada propia (reemplaza los títulos de tarjeta que siguen en inglés).
- [ ] **Subportales por proyecto**: página `/proyectos` con una tarjeta por
      sistema y `/proyectos/<proyecto>` con pestañas *Resumen · Componentes ·
      Documentación · APIs · Equipo*; franja de color y nombre del proyecto en la
      cabecera; selector de proyecto en la barra lateral.
- [ ] Addon de TechDocs que muestre el proyecto en la cabecera de cada documento.
- [ ] Búsqueda filtrada por proyecto (comprobar si el índice de TechDocs incluye
      el sistema; si no, añadirlo al indexar).
- [ ] Regla en el backend que rechace entidades sin `spec.system`.
- [ ] Probar `theme.language: es` en `mkdocs.yml` para traducir «Table of contents».

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

- [ ] Los repos de Estadística y Nutrición tienen un `CREDENCIALES.txt` en la
      carpeta local. El usuario dijo que los repos ya fueron verificados; aun así,
      antes de abrir el portal a más gente conviene confirmar que no esté versionado
      y, si lo estuvo, rotar esas claves.
- [ ] Reemplazar el token personal por una GitHub App de la organización (también
      resuelve las callbacks de varias direcciones).
- [ ] Política de permisos distinta de «permitir todo» antes de abrir a los 30.

## 7. Dónde está cada cosa

| Qué | Dónde |
|---|---|
| Configuración del portal | `app-config.yaml` (local), `app-config.production.yaml` (despliegue) |
| Base de datos local | `compose.yaml` |
| Backend (plugins) | `packages/backend/src/index.ts` |
| Frontend (extensiones) | `packages/app/src/App.tsx` y `packages/app/src/modules/` |
| Página de ingreso | `packages/app/src/modules/signIn/index.tsx` |
| Barra lateral | `packages/app/src/modules/nav/Sidebar.tsx` |
| Textos propios y traducciones | `packages/app/src/modules/idioma/` y `packages/app/translations/` |
| Dominio, sistemas y equipos | `catalog/hrl.yaml` |
| Arranque local | `iniciar.ps1` y `.env` (no versionado; ver `.env.example`) |
| Plan de despliegue | `docs/despliegue.md` |
| Idioma | `docs/idioma.md` |
| Este documento | `docs/estado-y-pendientes.md` |
