# ── Build stage ──────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production --ignore-scripts && \
    npm ci --ignore-scripts

COPY . .
RUN npm run build

# ── Production stage ─────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

RUN apk add --no-cache curl

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

RUN mkdir -p /app/uploads /app/backups

EXPOSE 3001
CMD ["node", "dist/main"]
