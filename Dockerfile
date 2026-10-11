# Multi-stage Dockerfile for Backstage
# Builds everything inside Docker - no local build required

# Stage 1: Build
FROM node:22-bookworm-slim AS build

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    g++ \
    build-essential \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

USER node
WORKDIR /app

# Copy package files
COPY --chown=node:node .yarn ./.yarn
COPY --chown=node:node .yarnrc.yml package.json yarn.lock ./

# Copy workspace package.json files
COPY --chown=node:node packages/backend/package.json ./packages/backend/
COPY --chown=node:node packages/app/package.json ./packages/app/

# Install dependencies
RUN yarn install --immutable

# Copy source code
COPY --chown=node:node . .

# Increase Node memory for build (Backstage builds are heavy)
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Build frontend and backend (with error output)
RUN yarn build:all 2>&1 || (echo "=== BUILD FAILED ===" && cat /tmp/*.log 2>/dev/null; exit 1)

# Stage 2: Production
FROM node:22-bookworm-slim AS production

RUN apt-get update && \
    apt-get install -y --no-install-recommends libsqlite3-dev && \
    rm -rf /var/lib/apt/lists/*

USER node
WORKDIR /app

# Copy yarn files
COPY --chown=node:node .yarn ./.yarn
COPY --chown=node:node .yarnrc.yml backstage.json ./

ENV NODE_ENV=production

# Copy built skeleton and install production deps
COPY --chown=node:node --from=build /app/yarn.lock /app/package.json ./
COPY --chown=node:node --from=build /app/packages/backend/dist/skeleton.tar.gz ./
RUN tar xzf skeleton.tar.gz && rm skeleton.tar.gz

RUN yarn workspaces focus --all --production

# Copy examples for catalog
COPY --chown=node:node examples ./examples

# Copy built bundle and config
COPY --chown=node:node --from=build /app/packages/backend/dist/bundle.tar.gz ./
COPY --chown=node:node app-config*.yaml ./
RUN tar xzf bundle.tar.gz && rm bundle.tar.gz

EXPOSE 7007

CMD ["node", "packages/backend", "--config", "app-config.yaml", "--config", "app-config.production.yaml"]
