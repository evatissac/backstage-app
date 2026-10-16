# Despliegue en Coolify: paso a paso

Cómo se montó el despliegue de prueba del portal (2026-10-01), para repetirlo en
el servidor del hospital. **Ese montaje se desmontó el 2026-10-02**: se borraron la
distro de WSL, Coolify, el túnel y la deploy key. En el servidor, los pasos 1 y 7
cambian (no hace falta WSL; con dirección fija no hace falta el túnel rápido). El plan y las decisiones están en
[Despliegue](despliegue.md); esta página es el procedimiento.

## Resultado

```
Internet ──> Cloudflare Quick Tunnel (contenedor cloudflared)
                 │  https://<nombre-aleatorio>.trycloudflare.com
                 ▼
       Ubuntu 24.04 en WSL2 (PC de Andre)
         ├── Coolify 4.3.23        panel en http://localhost:8000
         ├── portal-hrl            imagen construida desde la rama despliegue-coolify, puerto 7100
         └── portal-hrl-db         PostgreSQL 18, volumen persistente
```

## 1. Una distro Linux aislada (WSL2)

Coolify solo corre en Linux, así que se instaló Ubuntu 24.04 en WSL2, sin tocar
el Docker Desktop de Windows.

1. `wsl --install -d Ubuntu-24.04 --no-launch --web-download`
2. En `/etc/wsl.conf` de la distro:
   ```ini
   [boot]
   systemd=true

   [interop]
   appendWindowsPath=false
   ```
   `systemd` lo necesita Docker. `appendWindowsPath=false` evita que el
   instalador de Coolify encuentre el `docker` de Windows y crea que ya tiene uno.
3. `wsl --terminate Ubuntu-24.04` para que tome la configuración.
4. WSL apaga la distro cuando no hay procesos conectados. Un archivo `.vbs` en la
   carpeta de Inicio de Windows (`hrl-coolify-wsl.vbs`) deja oculto un
   `sleep infinity` dentro de la distro. Para desactivarlo, se borra ese archivo.

## 2. Instalar Coolify

Con los puertos 80, 443, 8000, 6001, 6002 y 8080 libres en Windows:

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | sudo bash
```

Tarda ~6 minutos: instala Docker, descarga las imágenes y arranca `coolify`,
`coolify-db`, `coolify-redis`, `coolify-realtime`, `coolify-proxy` (Traefik) y
`coolify-sentinel`. El panel queda en `http://localhost:8000`.

Al abrirlo por primera vez se crea la cuenta de administrador. El asistente
inicial se puede omitir: el instalador ya registró el servidor `localhost`.

## 3. Llave para clonar el repo

El repo es privado y Coolify lo clona por SSH con una *deploy key*.

1. En Coolify: *Keys & Tokens → Private Keys → New Private Key → ED25519*. Se
   renombra (`github-hrl-backstage`) y se copia **solo la clave pública**.
2. En GitHub, la organización `DevHRL` tenía las deploy keys desactivadas: hubo
   que permitirlas en la configuración de la organización.
3. Se agrega la clave pública al repo, **de solo lectura**:
   ```bash
   gh api -X POST repos/DevHRL/hrl-backstage/keys \
     -f title="Coolify local (Portal HRL)" -f key="<clave pública>" -F read_only=true
   ```

## 4. Login con GitHub

GitHub no permite crear OAuth Apps por API. En
`github.com/organizations/DevHRL/settings/applications/new`:

| Campo | Valor |
|---|---|
| Application name | Portal de Desarrollo HRL (Coolify) |
| Homepage URL | la dirección pública del portal |
| Authorization callback URL | `<dirección pública>/api/auth/github/handler/frame` |

Se genera un *client secret* y se guardan el ID y el secreto. Cada dirección
distinta necesita su propia callback: una OAuth App admite una sola.

## 5. Base de datos

En Coolify: proyecto **Portal HRL** → entorno *production* → *New* →
**PostgreSQL 18** (`postgres:18-alpine`, la misma versión que el Postgres local). Se guarda y se inicia. Su contraseña está en la ficha de la base,
bloque *Credentials*.

El portal la alcanza por el nombre interno del contenedor (el identificador de la
base) en la red `coolify`, puerto 5432.

## 6. La aplicación

*New → Private Repository (with Deploy Key)*:

| Campo | Valor |
|---|---|
| Repository URL | `git@github.com:DevHRL/hrl-backstage.git` |
| Branch | `despliegue-coolify` (después, `main`) |
| Build pack | Dockerfile |
| Dockerfile location | `/packages/backend/Dockerfile` |
| Ports Exposes | `7007` |
| Ports Mappings | `7100:7007` |
| Persistent storage | volumen `techdocs` → `/app/techdocs` |

El Dockerfile compila todo dentro de Docker (comprobación de tipos, frontend y
backend) e incluye MkDocs para que TechDocs compile la documentación sin Docker
adentro.

El dominio `sslip.io` que Coolify asigna por defecto no se usa: el acceso es por
el puerto 7100.

### Variables de entorno

| Variable | Valor |
|---|---|
| `PORTAL_URL` | dirección pública completa, con `https://` y sin barra final |
| `BACKEND_SECRET` | `openssl rand -base64 32` |
| `POSTGRES_HOST` | nombre interno del contenedor de la base |
| `POSTGRES_PORT` | `5432` |
| `POSTGRES_USER` | `postgres` |
| `POSTGRES_PASSWORD` | de la ficha de la base |
| `AUTH_GITHUB_CLIENT_ID` / `AUTH_GITHUB_CLIENT_SECRET` | de la OAuth App |
| `GITHUB_TOKEN` | token de lectura de `DevHRL` (permisos `repo`, `read:org`, `read:user`, `user:email`) |

Se cargan en *Environment Variables → Developer View*, una línea `CLAVE=valor` por
variable. Los secretos no se escriben en ningún archivo del repo.

Después, **Deploy**. El primer despliegue tarda ~12 minutos. Mientras compila, la
dirección pública da *502 Bad Gateway*: es normal.

## 7. Acceso desde internet: túnel de Cloudflare

Gratis, sin cuenta ni dominio:

```bash
docker run -d --name tunel-portal-hrl --restart unless-stopped --network host \
  cloudflare/cloudflared:latest tunnel --no-autoupdate --url http://localhost:7100
docker logs tunel-portal-hrl 2>&1 | grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' | head -1
```

La dirección que imprime es la que va en `PORTAL_URL`, en la OAuth App y en la
callback.

**Limitación:** la dirección **cambia cada vez que se recrea el contenedor del
túnel** (por ejemplo, al reiniciar el PC si Docker no lo restaura). Entonces hay
que actualizar la OAuth App y `PORTAL_URL` y redesplegar. Con un dominio propio
administrado en Cloudflare se usaría un túnel con nombre, de dirección fija.

## 8. Comprobaciones

- `curl http://localhost:7100/.backstage/health/v1/readiness` → `{"status":"ok"}`.
- La dirección pública muestra la pantalla de ingreso, **sin** tarjeta de invitado.
- Tras ingresar con una cuenta de `DevHRL`, el catálogo muestra los 3 sistemas.
- En la base: `select split_part(entity_ref, ':', 1), count(*) from refresh_state group by 1`
  dentro de `backstage_plugin_catalog` (3 sistemas, 3 equipos, los usuarios de la
  organización, el dominio y el componente del portal).

## Problemas que aparecieron

| Síntoma | Causa | Solución |
|---|---|---|
| `Deploy keys are disabled for this repository` | La organización las tenía desactivadas | Permitirlas en la configuración de `DevHRL` |
| `docker` de Windows visible dentro de Ubuntu | WSL añade el PATH de Windows | `appendWindowsPath=false` |
| 502 tras pulsar *Deploy* | Aún compilando, o el contenedor aún arrancando (~1 min) | Esperar; ver *Deployments* en Coolify |
| Aviso «Cannot connect to real-time service» | El panel no puede abrir su websocket | Solo afecta a las actualizaciones en vivo del panel; recargar la página |
| `no available server` | Traefik no tiene ningún contenedor sano: el `healthcheck` del servicio `backstage` falla o aún no termina el arranque (la preparación responde 503 hasta que todos los plugins inician; el primer arranque tarda varios minutos) | Esperar hasta 5 min tras el despliegue. Si persiste: en Coolify → servicio `backstage` → *Logs*, buscar el error del plugin que no inicia (casi siempre una variable vacía o la contraseña de Postgres) y, en el panel, comprobar que el dominio del servicio `backstage` termina en `:7007` y que `PORTAL_URL` es ese mismo dominio con `https://` |
