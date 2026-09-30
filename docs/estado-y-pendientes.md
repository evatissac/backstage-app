# Estado y pendientes

**Última actualización:** 2026-09-30. Léelo completo antes de tocar nada: explica
qué existe, qué se decidió, qué **no** se debe hacer todavía y qué sigue.

## 1. Resumen en 30 segundos

- Se está montando un portal **Backstage** para documentar y catalogar los sistemas
  del Hospital Regional de Loreto. Responsable: Andre.
- El portal **ya funciona en local** (login con GitHub, catálogo, TechDocs). Está en
  `DevHRL/hrl-backstage` (privado).
- Los repos del hospital se están moviendo a la organización de GitHub **`DevHRL`**.
- **No se ha desplegado** ni se va a hacer todavía. El plan de despliegue está
  escrito en [Migración a VPS](despliegue-vps.md).
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
| RotaPass y RotaPass-Admin | `GiancarloChavez` | **Fuera de `DevHRL`**; falta decidir si pertenecen al hospital |

Detalles que importan:

- **Oncología:** el espejo tiene las 11 ramas idénticas al original. Solo se cambió
  la URL del kit en `UI_standard` y `ficha14`. `main` (la desplegada) **no usa el
  kit** y no se tocó. El original **sigue recibiendo pushes** (por ejemplo `ficha14`).
  Las carpetas locales de Oncología aún apuntan a `evatissac/HIS_HRL`, a propósito.
- **El kit:** los proyectos lo instalan con una URL fijada a un tag. Se cambió la
  URL a `DevHRL/hrl-core-ui` en Estadística (`main`, `feature/backend-nucleo`) y en
  el espejo de Oncología. La URL vieja sigue funcionando por redirección.
- **Organización `DevHRL`:** el 2FA obligatorio está **desactivado** y los miembros
  pueden crear repos. Tiene 6 miembros. **No tiene equipos de GitHub.**

### El portal

| Pieza | Estado |
|---|---|
| Login con GitHub | ✅ Funciona. Solo entran los miembros de `DevHRL` (el usuario debe existir en el catálogo) |
| Ingreso como invitado | ⚠️ Activo solo para local; hay que quitarlo antes de desplegar |
| Catálogo | ✅ Dominio `salud-hrl`, 3 sistemas (`vigilancia-oncologica`, `reporte-estadistico`, `plataforma-hrl`), definidos en `catalog/hrl.yaml` |
| Descubrimiento de repos | ✅ Cada 30 min busca `catalog-info.yaml` en la raíz de cada repo de `DevHRL`. Hoy encuentra 5 repos, **ninguno con ese archivo salvo el portal** |
| Importación de miembros | ✅ Cada 60 min. Trae 6 usuarios con usuario, nombre y avatar. Sin correo |
| Equipos (Groups) | ⚠️ Los 3 de `catalog/hrl.yaml` existen pero **sin miembros** (ver sección 4) |
| TechDocs | ✅ Compila en local con Docker. Mermaid **no** se dibuja (ver decisiones) |
| Zoom de imágenes | ✅ Addon LightBox activo; **no probado con un `.drawio.svg` real** |
| Búsqueda | ✅ Índice en memoria (básico) |
| Base de datos | ⚠️ SQLite **en memoria**: se pierden sesiones y preferencias al detener el portal |
| Permisos | ⚠️ «Permitir todo» |
| Kubernetes | ⚠️ Plugin cargado sin configurar (deja un aviso en cada arranque) |
| Idioma | Todo en inglés salvo lo que escribimos |

## 3. Cómo retomar el trabajo

```powershell
cd C:\Users\Andre\Desktop\hrl-backstage
.\iniciar.ps1          # http://localhost:3000 (frontend), :7007 (backend)
```

Requisitos: Docker Desktop encendido (TechDocs; el script avisa si está apagado),
`.env` con las credenciales (copia de `.env.example`) y Yarn activado con Corepack.
Detalle en [Levantamiento local](levantamiento.md).

Cosas que ya dieron problemas:

- **`yarn install` falla con `got-npm-11.8.2...patch`**: error de publicación de
  `@yarnpkg/core`. Ya está corregido con una resolución en `package.json`.
- **Un arranque con «IPC request timed out»**: varios plugins fallaron una vez.
  Reiniciar el portal lo resolvió; si se repite, investigar.
- **Ver la página de ingreso**: si el navegador ya tiene sesión de invitado no
  aparece. Usar ventana privada o cerrar sesión en *Settings*.
- **Token de GitHub**: el importador de miembros necesita los permisos `repo`,
  `read:org`, `read:user` y `user:email`. Con menos, falla al leer el correo.
- **Capturas de pantalla**: hay Edge instalado; Playwright puede usarlo con
  `channel: 'msedge'` sin descargar nada.
- **Crear una OAuth App**: cada una admite una sola URL de callback, por eso
  producción necesitará la suya.

## 4. Decisiones tomadas

| Decisión | Detalle |
|---|---|
| **Backstage**, no BookStack ni otros | Equipo de ~30 personas; se aceptó el costo de mantenerlo. |
| **Login con GitHub** | La organización `DevHRL` es la fuente de usuarios. |
| **Alojamiento futuro: un VPS con Coolify** | Contenedor Backstage + recursos Postgres y MinIO. Ver [Migración a VPS](despliegue-vps.md). |
| **Descartados** | Supabase, Netlify, Vercel y Amplify. |
| **Diagramas: draw.io como `.drawio.svg`** | Con el addon LightBox para zoom y arrastre. **No instalar el plugin de Mermaid** salvo que no haya mejor alternativa. |
| **Commits del repo del portal** | A nombre de Andre (`Andre-pezo@outlook.es`), **sin** línea `Co-Authored-By` de Claude. |
| **Empezar con el portal estándar** | Se personaliza poco a poco; no se hace fork de Backstage. |

### Cosas que el usuario pidió NO hacer todavía

- **No documentar ningún repo** (ni `catalog-info.yaml`, ni `mkdocs.yml`, ni `docs/`).
- **No crear equipos** en GitHub ni asignar miembros a los del catálogo.
- **No desplegar**.

## 5. Decisiones abiertas

1. **Base de datos local:** ¿SQLite en archivo (simple, dos líneas de configuración)
   o Postgres en Docker (misma versión que el recurso de Coolify)?
   - Hay un **PostgreSQL 18 de Windows** ocupando el puerto 5432; si se usa Docker,
     mapear a `127.0.0.1:5433`.
   - Recomendación dada: SQLite ahora y Postgres en Docker al preparar el despliegue.
     El usuario aún no eligió.
2. **Idioma de la interfaz:** ¿traducir lo visible (menús, ingreso, portada) al
   español o dejarlo en inglés? Afecta a toda la personalización.
3. **RotaPass:** ¿es del hospital y entra en `DevHRL`?
4. **Oncología:** fecha de corte para dejar de usar `evatissac/HIS_HRL` y desplegar
   desde `DevHRL/HIS_HRL`. Al cortar: resincronizar lo que entró al original, recrear
   los 5 issues abiertos, secretos y webhooks, y cambiar el origen del despliegue.
5. **Nombre del espejo de Oncología:** hoy `HIS_HRL` (igual que el original).
   Renombrar cuando convenga; GitHub redirige.
6. **Acceso al portal en producción:** público en internet (solo login de GitHub) o
   detrás de VPN / red del hospital.
7. **Dominio:** aún no hay. Coolify da un `*.sslip.io` con HTTPS mientras tanto.

## 6. Pendientes, en orden sugerido

### A. Preparar el portal antes de personalizarlo

- [ ] Resolver la base de datos local (decisión abierta 1).
- [ ] Limpiar la plantilla: quitar chistes aleatorios, relojes de otras ciudades y
      enlaces a backstage.io de la portada; quitar Kubernetes; quitar la plantilla de
      ejemplo del Scaffolder y su carpeta `examples/`.
- [ ] Decidir e implementar el idioma (decisión abierta 2).
- [ ] Probar el LightBox con un `.drawio.svg` real.

### B. Personalización (después de A)

- [ ] Tema con colores y fuentes de `hrl-core-ui`.
- [ ] Logo, favicon y título.
- [ ] Barra lateral y portada propias.
- [ ] Revisar cómo encaja la paleta con el modo oscuro.

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

### E. Despliegue (solo cuando el usuario lo pida)

Ver el orden completo en [Migración a VPS](despliegue-vps.md). Resumen:
VPS con Coolify → GitHub App y OAuth App de producción → `app-config.production.yaml`
reescrito, Dockerfile, workflow de imagen y sin invitado → recursos Postgres y MinIO
→ **respaldos fuera del VPS, probados** → TechDocs por CI en un repo piloto →
política de permisos propia.

### F. Seguridad

- [ ] Los repos de Estadística y Nutrición tienen un `CREDENCIALES.txt` en la
      carpeta local. El usuario dijo que los repos ya fueron verificados; aun así,
      antes de abrir el portal a más gente conviene confirmar que no esté versionado
      y, si lo estuvo, rotar esas claves.
- [ ] Reemplazar el token personal por una GitHub App de la organización.
- [ ] Política de permisos distinta de «permitir todo» antes de abrir a los 30.

## 7. Dónde está cada cosa

| Qué | Dónde |
|---|---|
| Configuración del portal | `app-config.yaml` (local), `app-config.production.yaml` (**por reescribir**) |
| Backend (plugins) | `packages/backend/src/index.ts` |
| Frontend (extensiones) | `packages/app/src/App.tsx` y `packages/app/src/modules/` |
| Página de ingreso | `packages/app/src/modules/signIn/index.tsx` |
| Dominio, sistemas y equipos | `catalog/hrl.yaml` |
| Arranque local | `iniciar.ps1` y `.env` (no versionado; ver `.env.example`) |
| Plan de despliegue | `docs/despliegue-vps.md` |
| Este documento | `docs/estado-y-pendientes.md` |
