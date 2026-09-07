# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos del monorepo
COPY . .

# Instalar dependencias
RUN npm ci

# Generar Prisma Client
RUN npm run db:generate --workspace=@sweet-grace/backend

# Build
RUN npm run build --workspace=@sweet-grace/backend

# Production stage
FROM node:18-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copiar solo archivos necesarios
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/node_modules ./node_modules
COPY --from=builder /app/apps/backend/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

CMD ["node", "dist/main"]
