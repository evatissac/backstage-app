# Imagen del portal. Se construye desde la raíz del repo y compila todo dentro
# de Docker, así que Coolify la puede construir directamente desde GitHub:
#
#   docker build -f packages/backend/Dockerfile .
#
# Basado en el Dockerfile multietapa de la documentación de Backstage
# (https://backstage.io/docs/deployment/docker#multi-stage-build), con MkDocs
# añadido para que TechDocs compile la documentación dentro del contenedor.

# Etapa 1: esqueleto con solo los package.json, para que la capa de
# `yarn install` no se invalide con cada cambio de código.
FROM node:24-trixie-slim AS packages

WORKDIR /app
COPY backstage.json package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
COPY packages packages

RUN find packages \! -name "package.json" -mindepth 2 -maxdepth 2 -exec rm -rf {} \+

# Etapa 2: instalar dependencias y compilar frontend y backend.
FROM node:24-trixie-slim AS build

# Herramientas para compilar módulos nativos (isolated-vm, better-sqlite3).
ENV PYTHON=/usr/bin/python3
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && \
    apt-get install -y --no-install-recommends python3 g++ build-essential && \
    rm -rf /var/lib/apt/lists/*

USER node
WORKDIR /app

COPY --from=packages --chown=node:node /app .

RUN --mount=type=cache,target=/home/node/.cache/yarn,sharing=locked,uid=1000,gid=1000 \
    yarn install --immutable

COPY --chown=node:node . .

RUN yarn tsc
RUN yarn --cwd packages/backend build

RUN mkdir packages/backend/dist/skeleton packages/backend/dist/bundle \
    && tar xzf packages/backend/dist/skeleton.tar.gz -C packages/backend/dist/skeleton \
    && tar xzf packages/backend/dist/bundle.tar.gz -C packages/backend/dist/bundle

# Etapa 3: imagen final, solo con dependencias de producción.
FROM node:24-trixie-slim

ENV PYTHON=/usr/bin/python3
# python3-venv: MkDocs para TechDocs (techdocs.generator.runIn: local).
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && \
    apt-get install -y --no-install-recommends python3 python3-venv g++ build-essential && \
    rm -rf /var/lib/apt/lists/*

RUN python3 -m venv /opt/mkdocs && \
    /opt/mkdocs/bin/pip install --no-cache-dir mkdocs-techdocs-core
ENV PATH="/opt/mkdocs/bin:${PATH}"

USER node
WORKDIR /app

COPY --from=build --chown=node:node /app/.yarn ./.yarn
COPY --from=build --chown=node:node /app/.yarnrc.yml ./
COPY --from=build --chown=node:node /app/backstage.json ./
COPY --from=build --chown=node:node /app/yarn.lock /app/package.json /app/packages/backend/dist/skeleton/ ./

RUN --mount=type=cache,target=/home/node/.cache/yarn,sharing=locked,uid=1000,gid=1000 \
    yarn workspaces focus --all --production && rm -rf "$(yarn cache clean)"

COPY --from=build --chown=node:node /app/packages/backend/dist/bundle/ ./
COPY --chown=node:node app-config.yaml app-config.production.yaml ./
# Dominio, sistemas y equipos del hospital (catalog.locations en app-config.production.yaml).
COPY --chown=node:node catalog ./catalog
# Plantillas de los caminos dorados (página «Crear»).
COPY --chown=node:node plantillas ./plantillas

# Documentación compilada por TechDocs; en Coolify se monta un volumen aquí.
RUN mkdir -p /app/techdocs

ENV NODE_ENV=production
# Necesario para el sandbox de plantillas del Scaffolder en Node 20 o superior.
ENV NODE_OPTIONS="--no-node-snapshot"

EXPOSE 7007
CMD ["node", "packages/backend", "--config", "app-config.yaml", "--config", "app-config.production.yaml"]
