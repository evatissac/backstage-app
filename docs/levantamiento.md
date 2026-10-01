# Levantamiento local

## Requisitos

| Herramienta | Versión | Para qué |
|---|---|---|
| Node.js | 22 o 24 | Ejecuta el portal |
| Yarn | 4 (lo trae el repo en `.yarn/releases`) | Gestor de paquetes; se activa con Corepack |
| Docker Desktop | Encendido | Base de datos (Postgres) y compilación de la documentación (imagen `spotify/techdocs`) |
| GitHub CLI (`gh`) | Con sesión iniciada | Da el token de lectura de la organización |

Activar Yarn sin permisos de administrador:

```powershell
corepack enable --install-directory "$env:APPDATA\corepack-bin"
# y añadir esa carpeta al PATH del usuario
```

## Arrancar

```powershell
yarn install      # solo la primera vez o al cambiar dependencias
.\iniciar.ps1     # levanta Postgres, toma el token de gh y arranca frontend y backend
```

- Frontend: <http://localhost:3000>
- Backend: <http://localhost:7007>

`iniciar.ps1` exporta `GITHUB_TOKEN` a partir de `gh auth token`. El token no
se guarda en ningún archivo.

## Base de datos

PostgreSQL 17 en Docker, definido en `compose.yaml`: la misma imagen que usará el
recurso de Coolify, para no cambiar de motor al desplegar. `iniciar.ps1` lo levanta
y espera a que esté listo; si Docker está apagado, se detiene.

- Escucha solo en `127.0.0.1:5433`: el 5432 lo ocupa el PostgreSQL de Windows.
- Usuario y contraseña: `POSTGRES_USER` y `POSTGRES_PASSWORD` de `.env`; si faltan,
  `backstage` / `backstage` (no es un secreto: no sale del equipo).
- Los datos viven en el volumen `hrl-backstage_datos` y sobreviven a los
  reinicios. Backstage crea una base por plugin (`backstage_plugin_catalog`, …).

```powershell
docker compose logs postgres          # ver qué pasa si no arranca
docker compose down                   # detener la base (los datos se conservan)
docker compose down -v                # borrar también los datos: el catálogo se
                                      # reconstruye solo, pero se pierden sesiones y preferencias
```

## Idioma

El portal es bilingüe. Si agregas un plugin o actualizas Backstage, sigue
[Idioma del portal](idioma.md) para exportar y completar las traducciones.

## Problema conocido en la instalación

`@yarnpkg/core@4.9.2`, que usa el CLI de Backstage, se publicó con una
dependencia a un parche de `got` que solo existe en el repo de Yarn, y
`yarn install` falla con `ENOENT ... got-npm-11.8.2-c1eb105458.patch`. Se
corrige en `package.json`:

```json
"resolutions": {
  "@yarnpkg/core/got": "^11.8.6"
}
```

Cuando Backstage o Yarn publiquen la corrección, esta línea se puede quitar.
