# Levantamiento local

## Requisitos

| Herramienta | Versión | Para qué |
|---|---|---|
| Node.js | 22 o 24 | Ejecuta el portal |
| Yarn | 4 (lo trae el repo en `.yarn/releases`) | Gestor de paquetes; se activa con Corepack |
| Docker Desktop | Encendido | Compila la documentación (imagen `spotify/techdocs`) |
| GitHub CLI (`gh`) | Con sesión iniciada | Da el token de lectura de la organización |

Activar Yarn sin permisos de administrador:

```powershell
corepack enable --install-directory "$env:APPDATA\corepack-bin"
# y añadir esa carpeta al PATH del usuario
```

## Arrancar

```powershell
yarn install      # solo la primera vez o al cambiar dependencias
.\iniciar.ps1     # toma el token de gh y arranca frontend y backend
```

- Frontend: <http://localhost:3000>
- Backend: <http://localhost:7007>

`iniciar.ps1` exporta `GITHUB_TOKEN` a partir de `gh auth token`. El token no
se guarda en ningún archivo.

## Base de datos

En local se usa SQLite en memoria: el catálogo se reconstruye en cada arranque
leyendo los `catalog-info.yaml`, así que no se pierde nada importante. Las
preferencias de usuario sí se pierden. En el despliegue se usará PostgreSQL
(`app-config.production.yaml`).

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
