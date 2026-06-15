# ── Build stage ──────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Copy root monorepo manifests so npm ci finds the lockfile
COPY package*.json ./
COPY packages/types/package.json ./packages/types/
COPY apps/api/package.json ./apps/api/

# Single install pass with all deps (devDeps needed for TypeScript build)
RUN npm ci --ignore-scripts

# Copy source for the packages we need to build
COPY packages/types ./packages/types
COPY apps/api ./apps/api

# Build shared types first, then the API
RUN npm run build --workspace=packages/types && \
    npm run build --workspace=apps/api

# Strip devDependencies before copying to production image
RUN npm prune --production

# ── Production stage ─────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

RUN apk add --no-cache curl

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./

RUN mkdir -p /app/uploads /app/backups

EXPOSE 3001
CMD ["node", "dist/main"]
