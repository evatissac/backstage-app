# Levantamiento local

## Requisitos

| Herramienta | Versión | Para qué |
|---|---|---|
| Node.js | 22 o 24 | Ejecuta el portal |
| Yarn | 4 (lo trae el repo en `.yarn/releases`) | Gestor de paquetes; se activa con Corepack |
| PostgreSQL | 18, el de Windows (servicio `postgresql-x64-18`) | Base de datos del portal |
| Docker Desktop | Encendido | Compilación de la documentación (imagen `spotify/techdocs`) |
| GitHub CLI (`gh`) | Con sesión iniciada | Da el token de lectura de la organización |

Activar Yarn sin permisos de administrador:

```powershell
corepack enable --install-directory "$env:APPDATA\corepack-bin"
# y añadir esa carpeta al PATH del usuario
```

## Arrancar

```powershell
yarn install      # solo la primera vez o al cambiar dependencias
.\iniciar.ps1     # comprueba Postgres, toma el token de gh y arranca frontend y backend
```

- Frontend: <http://localhost:3000>
- Backend: <http://localhost:7007>

`iniciar.ps1` exporta `GITHUB_TOKEN` a partir de `gh auth token`. El token no
se guarda en ningún archivo.

## Base de datos

El PostgreSQL 18 instalado en Windows (`127.0.0.1:5432`). `iniciar.ps1` lee
`POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER` y `POSTGRES_PASSWORD` de `.env`
y se detiene si la base no responde.

El portal usa su propio rol, `backstage`, con permiso para crear bases: Backstage
crea una por plugin (`backstage_plugin_catalog`, …). Se crea una sola vez, con la
contraseña que está en `.env`, desde una consola con el usuario `postgres`:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h 127.0.0.1 -U postgres `
  -c "CREATE ROLE backstage LOGIN CREATEDB PASSWORD '<POSTGRES_PASSWORD de .env>'"
```

`compose.yaml` queda como alternativa (Postgres 18 en Docker, puerto 5433) para
un equipo sin Postgres instalado: `docker compose up -d --wait` y en `.env`
`POSTGRES_PORT=5433`.

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
