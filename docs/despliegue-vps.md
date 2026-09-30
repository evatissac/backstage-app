# Migración a VPS (pendiente)

Plan acordado para pasar el portal de local a un servidor. **Aún no se ejecuta**:
esta página reúne todo lo que hay que cambiar para cuando se haga.

## Arquitectura destino

```
GitHub Actions ──build──> imagen en GHCR ──pull──> VPS con Coolify
                                                     ├── contenedor Backstage
                                                     ├── PostgreSQL     (recurso de Coolify, volumen persistente)
                                                     └── MinIO          (recurso de Coolify, TechDocs compilados)
```

- **Todo vive en un solo VPS administrado con Coolify.** Supabase, Netlify, Vercel
  y Amplify están descartados: las últimas tres ejecutan funciones efímeras o
  sitios estáticos, y Backstage necesita un proceso vivo (tareas programadas cada
  30/60 min), Postgres y almacenamiento.
- **El VPS guarda estado** (la base y los documentos), así que los respaldos
  dejan de ser opcionales. Ver la sección 4.
- **Tamaño**: mínimo 4 GB de RAM y 2 vCPU. Backstage usa ~1 GB, Postgres ~250 MB,
  MinIO ~200 MB, y Coolify y el sistema el resto. Con 8 GB hay margen para compilar
  imágenes en el propio servidor. Disco: 40 GB o más.
- Railway o Render sirven como reemplazo si algún día no se quiere administrar servidor.

## 1. Cambios en el repo

### `app-config.production.yaml` (reescribir)

La versión actual es la de la plantilla y **no sirve**: carga las entidades de
ejemplo (su lista de `catalog.locations` *reemplaza* a la de `app-config.yaml` y
se perderían `catalog/hrl.yaml`), mantiene el invitado y apunta a `localhost`.

```yaml
app:
  baseUrl: https://${PORTAL_HOST}

backend:
  baseUrl: https://${PORTAL_HOST}
  listen: ':7007'
  auth:
    keys:
      - secret: ${BACKEND_SECRET}        # openssl rand -base64 32
  cors:
    origin: https://${PORTAL_HOST}
  database:
    client: pg
    connection:
      host: ${POSTGRES_HOST}             # nombre interno del recurso Postgres en Coolify
      port: 5432
      user: ${POSTGRES_USER}
      password: ${POSTGRES_PASSWORD}
    # Con un Postgres propio se usa el modo por defecto (una base por plugin);
    # el usuario debe poder crear bases de datos. Sin SSL: la red es interna.

auth:
  environment: production
  providers:
    # Sin guest: solo GitHub.
    github:
      production:
        clientId: ${AUTH_GITHUB_CLIENT_ID}
        clientSecret: ${AUTH_GITHUB_CLIENT_SECRET}
        signIn:
          resolvers:
            - resolver: usernameMatchingUserEntityName

catalog:
  locations:
    - type: file
      target: ./catalog/hrl.yaml
      rules:
        - allow: [Domain, System, Group, User]

techdocs:
  builder: external                      # se compila en CI, no en el servidor
  publisher:
    type: awsS3                          # MinIO habla el protocolo de S3
    awsS3:
      bucketName: techdocs
      endpoint: http://${MINIO_HOST}:9000
      s3ForcePathStyle: true
      credentials:
        accessKeyId: ${TECHDOCS_S3_ACCESS_KEY_ID}
        secretAccessKey: ${TECHDOCS_S3_SECRET_ACCESS_KEY}
```

Notas:

- Rutas `file`: en la imagen el backend corre desde `/app`, por eso
  `./catalog/hrl.yaml` y no `../../catalog/hrl.yaml` como en local.
- Los workflows de TechDocs de cada repo (que corren en GitHub) tienen que poder
  alcanzar MinIO: exponerlo con su propio subdominio y HTTPS, o publicar los
  documentos desde el VPS. Decidirlo al configurarlo.
- Revisar si la plantilla de ejemplo del Scaffolder (`examples/template`) se
  conserva; si no, quitar también `examples/` de la imagen.

### `app-config.yaml` (desarrollo) — nada obligatorio

Mantiene SQLite y el invitado para trabajar en local. Si en algún momento se usa
Postgres en Docker local, que sea la misma versión que el recurso de Coolify.

### Frontend: quitar el invitado de la página de ingreso

`packages/app/src/modules/signIn/index.tsx`: quitar `'guest'` de `providers`, o
mostrarlo solo cuando `process.env.NODE_ENV === 'development'`.

### `packages/backend/Dockerfile`

El actual espera el portal **ya compilado** fuera de Docker
(`packages/backend/dist/*.tar.gz`) y copia `examples/`. Hay que:

1. Copiar también `catalog/` a la imagen.
2. Elegir cómo compilar:
   - **Recomendado**: GitHub Actions ejecuta `yarn install --immutable`,
     `yarn tsc`, `yarn build:backend` y luego `docker build` con este Dockerfile.
   - Alternativa: Dockerfile multi-etapa que compile dentro de Docker (Coolify lo
     hace solo, pero el servidor necesita ~4 GB libres para compilar).

### GitHub Actions (nuevos)

- `.github/workflows/imagen.yml`: en cada push a `main`, compilar y publicar
  `ghcr.io/devhrl/hrl-backstage:<sha>` y `:latest`. Opcional: avisar a Coolify
  por webhook para redesplegar.
- Workflow reutilizable de TechDocs para los demás repos: `techdocs-cli generate`
  + `techdocs-cli publish --publisher-type awsS3 ...` hacia el bucket de MinIO,
  en cada push que toque `docs/` o `mkdocs.yml`.

## 2. Recursos y credenciales a crear

| Qué | Dónde | Para qué |
|---|---|---|
| **OAuth App de producción** | github.com/organizations/DevHRL/settings/applications | Login. Callback: `https://<host>/api/auth/github/handler/frame`. La de local no sirve: una OAuth App admite una sola callback. |
| **GitHub App de DevHRL** (reemplaza al token clásico) | github.com/organizations/DevHRL/settings/apps | Lectura de repos y miembros. Permisos: *Contents: Read*, *Metadata: Read*, *Members: Read* (organización). Instalarla en todos los repos. No caduca ni depende de una persona. |
| **Recurso PostgreSQL** | Coolify → Databases | Catálogo, sesiones y preferencias. Volumen persistente y respaldos programados. |
| **Recurso MinIO** + bucket `techdocs` + claves de acceso | Coolify → Services | Documentación compilada. |
| **Secreto del backend** | `openssl rand -base64 32` | `BACKEND_SECRET`. |

Configuración de la GitHub App en Backstage (credenciales fuera del repo; el
patrón `*-credentials.yaml` ya está en `.gitignore`):

```yaml
integrations:
  github:
    - host: github.com
      apps:
        - $include: github-app-credentials.yaml   # appId, clientId, clientSecret, privateKey
```

## 3. Variables de entorno en Coolify

| Variable | Origen |
|---|---|
| `PORTAL_HOST` | Dominio del portal (o el `*.sslip.io` que da Coolify mientras no haya dominio) |
| `BACKEND_SECRET` | Generado |
| `POSTGRES_HOST`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | Recurso PostgreSQL de Coolify (host interno) |
| `AUTH_GITHUB_CLIENT_ID`, `AUTH_GITHUB_CLIENT_SECRET` | OAuth App de producción |
| Credenciales de la GitHub App | Archivo montado como secreto (`github-app-credentials.yaml`) |
| `MINIO_HOST`, `TECHDOCS_S3_ACCESS_KEY_ID`, `TECHDOCS_S3_SECRET_ACCESS_KEY` | Recurso MinIO |

Comando del contenedor: el del Dockerfile ya carga `app-config.yaml` y
`app-config.production.yaml` en ese orden.

## 4. Operación

- **Respaldos (obligatorios)**: programar en Coolify el respaldo diario de
  Postgres y del bucket de MinIO hacia un destino **fuera del VPS**
  (S3 externo o un segundo servidor). Un respaldo en el mismo disco no protege si
  el servidor se pierde. Probar una restauración antes de dar el portal por
  estable. Lo que se pierde sin respaldo: sesiones, preferencias y la
  documentación publicada (el catálogo se reconstruye solo desde GitHub).
- **Salud**: configurar en Coolify el health check
  `/.backstage/health/v1/readiness`.
- **Servidor**: mantener el sistema operativo actualizado, cortafuegos con solo
  los puertos 22, 80 y 443, y acceso por llave SSH.
- **Actualizaciones de Backstage**: trimestrales, `yarn backstage-cli versions:bump`,
  probando antes en local. Al hacerlo, revisar si ya se puede quitar la resolución
  `"@yarnpkg/core/got"` del `package.json` (ver [Levantamiento local](levantamiento.md)).
- **Permisos**: la política actual es «permitir todo»
  (`permission-backend-module-allow-all-policy`). Definir una propia antes de
  abrir el portal a los 30 usuarios.
- **Acceso de red**: decidir si el portal queda público en internet (protegido
  solo por el login de GitHub) o detrás de VPN / red del hospital.

## 5. Orden de ejecución

1. Contratar el VPS e instalar Coolify.
2. Crear la GitHub App y la OAuth App de producción.
3. En el repo: `app-config.production.yaml`, Dockerfile, workflow de imagen,
   quitar el invitado del frontend.
4. En Coolify: recursos Postgres y MinIO, aplicación desde la imagen de GHCR,
   variables de entorno, dominio y health check.
5. Configurar y **probar** los respaldos.
6. Probar ingreso, catálogo y descubrimiento; después, el workflow de TechDocs en
   un repo piloto.
