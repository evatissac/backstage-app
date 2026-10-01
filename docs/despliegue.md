# Despliegue (pendiente)

Plan acordado para sacar el portal de local. **Aún no se ejecuta**: esta página
reúne lo decidido y lo que falta para cuando se haga.

## Decisiones

| Qué | Decisión | Por qué |
|---|---|---|
| **Presupuesto** | Todo gratuito | Requisito del proyecto |
| **Dónde, por ahora** | **Coolify autoalojado** en un equipo de Andre, para presentar el catálogo | No depende de TI ni de una nube; la mudanza es barata (ver abajo) |
| **Dónde, después** | Un servidor dedicado (idealmente del hospital) con el mismo Coolify | Un equipo personal se apaga cuando se apaga su dueño |
| **Instancias** | **Una sola**, con un subportal por proyecto | Los proyectos pueden compartir base de datos; lo que importa es que la navegación deje claro en qué proyecto se está |
| **Base de datos** | PostgreSQL 17 (`postgres:17-alpine`), también en local | Mismo motor en todas partes: no se cambia de base al migrar |
| **Respaldos** | Fuera del equipo, en Cloudflare R2 (10 GB gratis) | Un respaldo en el mismo disco no protege si el equipo falla |
| **Login** | GitHub, solo miembros de `DevHRL` | Sin invitado en producción |

### Alternativas descartadas

| Opción | Motivo |
|---|---|
| Oracle Cloud Always Free | Redujo su capa ARM de 4 OCPU/24 GB a 2 OCPU/12 GB en junio de 2026 sin avisar, y termina las instancias que la exceden. No inspira confianza para un servicio que debe durar |
| Google Cloud e2-micro | 1 GB de RAM: no alcanza para Backstage y Postgres |
| Render, Heroku, Koyeb | 512 MB y se duermen sin tráfico: se cortan las tareas programadas del catálogo. El Postgres gratis de Render caduca a los 30 días |
| Railway, Fly.io | Solo pruebas temporales |
| AWS | Desde julio de 2025 solo da crédito (hasta 200 USD por 12 meses), no un servidor gratis |
| Hugging Face Spaces | Los Spaces con Docker exigen plan de pago |
| Tailscale (para exponer el equipo) | Su plan gratis es solo para uso no comercial y no incluye Funnel |
| Supabase, Netlify, Vercel, Amplify | Funciones efímeras o sitios estáticos; Backstage necesita un proceso vivo |
| Una instancia por proyecto | Multiplica RAM, OAuth Apps y mantenimiento sin necesidad: la separación se resuelve con subportales |

## Arquitectura

```
Equipo con Coolify
  ├── contenedor Backstage   (imagen construida desde este repo)
  ├── PostgreSQL 17          (recurso de Coolify, volumen persistente)
  └── volumen de TechDocs    (documentación compilada)
            │
            └── respaldo diario ──> Cloudflare R2
```

**Recursos**: mínimo 4 GB de RAM libres y 2 núcleos. Backstage usa ~1 GB,
Postgres ~250 MB, y Coolify y el sistema el resto. Coolify necesita Linux: en
Windows, dentro de WSL2 o de una máquina virtual.

**Por qué la mudanza es barata**: el estado vive en Postgres y en el volumen de
TechDocs. Pasar al servidor dedicado es instalar Coolify allí, restaurar el
respaldo y apuntar el dominio; el catálogo se reconstruye solo desde GitHub.

## Acceso y dominio (todo gratuito)

Con una sola instancia basta **un nombre**.

1. **Mientras tanto**: `http://<ip-del-equipo>` en la red local, o el
   `*.sslip.io` con HTTPS que da Coolify.
2. **Nombre fijo**: un subdominio de DuckDNS (`hrl-portal.duckdns.org`), gratis;
   Coolify emite el certificado.
3. **A largo plazo**: un subdominio del dominio institucional del hospital (lo
   agrega TI; no cuesta dinero).
4. **Desde fuera de la red**, si hace falta: Cloudflare Tunnel (gratis, no abre
   puertos). Exige un dominio completo administrado en Cloudflare.

El login con GitHub funciona aunque el portal solo sea accesible en la red local:
el callback es una redirección del navegador, no una llamada de GitHub al
servidor. Cada dirección nueva exige su URL de callback (ver abajo).

## 1. Cambios en el repo

### Ya hechos

- `app-config.production.yaml` reescrito: URL desde `PORTAL_URL`, Postgres,
  secreto del backend, login solo con GitHub y catálogo desde
  `./catalog/hrl.yaml`.
- `packages/backend/Dockerfile` copia `catalog/` (ya no `examples/`).
- El invitado no aparece en la página de ingreso fuera de desarrollo, y el
  backend lo rechaza fuera de `NODE_ENV=development`.

### Pendientes

**TechDocs en el contenedor.** Hoy se compila con Docker (`runIn: docker`), que
no está disponible dentro del contenedor. Para la versión provisional, lo más
simple:

```yaml
techdocs:
  builder: local
  generator:
    runIn: local          # mkdocs instalado en la propia imagen
  publisher:
    type: local           # carpeta en un volumen persistente
```

Requiere instalar en el Dockerfile Python, `mkdocs-techdocs-core` y montar un
volumen en la carpeta de publicación. Cuando haya más repos documentados,
pasar a compilar en CI y publicar en un bucket compatible con S3 (R2 o MinIO).

**Compilar la imagen.** El Dockerfile espera el portal ya compilado fuera de
Docker (`packages/backend/dist/*.tar.gz`). Opciones:

- **Recomendado**: GitHub Actions ejecuta `yarn install --immutable`, `yarn tsc`,
  `yarn build:backend` y `docker build`, y publica en
  `ghcr.io/devhrl/hrl-backstage`. Coolify descarga la imagen.
- Alternativa: Dockerfile multietapa que compile dentro de Docker. Coolify lo
  hace solo, pero el equipo necesita ~4 GB libres para compilar.

**SQLite fuera de la imagen.** Ya no se usa: se puede quitar `libsqlite3-dev`
del Dockerfile y `better-sqlite3` de las dependencias del backend.

## 2. Recursos y credenciales a crear

| Qué | Dónde | Para qué |
|---|---|---|
| **OAuth App para esta dirección** | github.com/organizations/DevHRL/settings/applications | Login. Callback: `<PORTAL_URL>/api/auth/github/handler/frame`. Una OAuth App admite una sola callback |
| **GitHub App de DevHRL** (después, reemplaza al token y a las OAuth Apps) | github.com/organizations/DevHRL/settings/apps | Admite hasta 10 callbacks, así que sirve para todas las direcciones. Permisos: *Contents: Read*, *Metadata: Read*, *Members: Read* |
| **Recurso PostgreSQL** | Coolify → Databases, imagen `postgres:17-alpine` | Catálogo, sesiones y preferencias. El usuario debe poder crear bases (Backstage crea una por plugin) |
| **Secreto del backend** | `openssl rand -base64 32` | `BACKEND_SECRET` |
| **Bucket de respaldos** | Cloudflare R2 | Respaldos diarios de Postgres y del volumen de TechDocs |

## 3. Variables de entorno en Coolify

| Variable | Origen |
|---|---|
| `PORTAL_URL` | Dirección completa del portal, con `http://` o `https://` y sin barra final |
| `BACKEND_SECRET` | Generado |
| `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | Recurso PostgreSQL de Coolify (host interno, puerto 5432) |
| `AUTH_GITHUB_CLIENT_ID`, `AUTH_GITHUB_CLIENT_SECRET` | OAuth App de esta dirección |
| `GITHUB_TOKEN` | Token de lectura de `DevHRL` (hasta que exista la GitHub App) |

## 4. Operación

- **Respaldos (obligatorios)**: programar en Coolify el respaldo diario de
  Postgres hacia R2, y **probar una restauración** antes de dar el portal por
  estable. Sin respaldo se pierden sesiones, preferencias (incluido el idioma de
  cada usuario) y la documentación compilada; el catálogo se reconstruye solo.
- **Salud**: health check `/.backstage/health/v1/readiness`.
- **Permisos**: la política es «permitir todo». Aceptable para presentar con el
  acceso limitado a miembros de `DevHRL`; definir una propia antes de abrir el
  portal a los 30 usuarios.
- **Actualizaciones de Backstage**: trimestrales, `yarn backstage-cli versions:bump`,
  probando antes en local. Después, `yarn traducciones:exportar` y
  `yarn traducciones:comprobar` (ver [Idioma](idioma.md)).

## 5. Orden de ejecución

1. Confirmar dónde corre Coolify (Linux, WSL2 o máquina virtual) y cómo se
   llegará al portal (red local, `sslip.io`, DuckDNS o túnel).
2. TechDocs en el contenedor y compilación de la imagen (sección 1).
3. OAuth App para la dirección elegida.
4. En Coolify: recurso Postgres, aplicación desde la imagen, variables, dominio
   y health check.
5. Configurar y **probar** los respaldos a R2.
6. Probar ingreso, catálogo, descubrimiento, idioma y documentación.
