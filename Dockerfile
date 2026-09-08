# Build stage
FROM node:18-bullseye AS builder

WORKDIR /app

# Copy all package files
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY apps/frontend/package*.json ./apps/frontend/

# Install all dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN cd apps/backend && npx prisma generate

# Build applications
RUN npm run build

# Runtime stage
FROM node:18-bullseye-slim

WORKDIR /app

# Install tini for proper signal handling
RUN apt-get update && apt-get install -y tini && rm -rf /var/lib/apt/lists/*

# Copy package files for dependency installation
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/

# Install production dependencies
RUN npm install --omit=dev --workspaces

# Copy built backend from builder
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma

# Copy node_modules from builder (production only)
COPY --from=builder /app/node_modules ./node_modules

# Set NODE_ENV
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Expose ports
EXPOSE 3001

# Start backend with tini
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "apps/backend/dist/main.js"]
