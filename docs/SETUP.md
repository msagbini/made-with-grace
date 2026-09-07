# 🚀 Setup y Desarrollo

## Requisitos Previos

- Node.js 18+
- npm 9+
- Docker & Docker Compose
- Git

## Instalación Rápida

```bash
# 1. Clonar repositorio
git clone <repo-url>
cd sweet-grace-shop

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
# .env.local ya está en el repo (para desarrollo)
# En producción, usar .env.production

# 4. Iniciar servicios de desarrollo (PostgreSQL, Redis)
npm run docker:up

# 5. Ejecutar migraciones de BD
npm run db:migrate

# 6. Poblar BD con datos iniciales (opcional)
npm run db:seed

# 7. Iniciar aplicación (frontend + backend en paralelo)
npm run dev
```

## URLs de Desarrollo

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **API Docs (Swagger):** http://localhost:3001/api
- **PgAdmin:** http://localhost:5050 (admin@sweetgrace.com / admin)

## Estructura de Carpetas

```
sweet-grace-shop/
├── apps/
│   ├── frontend/          # Next.js 14
│   └── backend/           # NestJS
├── packages/
│   └── shared/            # Tipos compartidos
├── docs/                  # Documentación
├── .github/workflows/     # CI/CD
└── docker-compose.yml
```

## Comandos Útiles

```bash
# Frontend
npm run dev --workspace=@sweet-grace/frontend    # Desarrollo
npm run build --workspace=@sweet-grace/frontend  # Build producción
npm run lint --workspace=@sweet-grace/frontend   # Linter

# Backend
npm run dev --workspace=@sweet-grace/backend                # Desarrollo
npm run build --workspace=@sweet-grace/backend              # Build
npm run db:migrate --workspace=@sweet-grace/backend         # Migraciones
npm run db:seed --workspace=@sweet-grace/backend            # Seed
npm run db:studio --workspace=@sweet-grace/backend          # Prisma Studio

# Ambos
npm run dev        # Desarrollo
npm run build      # Build
npm run lint       # Linting
npm run test       # Tests
```

## Variables de Entorno

Ver `.env.example` para todas las variables disponibles.

**Desarrollo local:** `.env.local` (ya incluido)
**Staging:** `.env.staging`
**Producción:** `.env.production` (nunca commitear)

## Base de Datos

### Migraciones

```bash
# Crear nueva migración
npx prisma migrate dev --name "nombre_migracion"

# Aplicar migraciones
npm run db:migrate

# Ver estado
npx prisma migrate status
```

### Prisma Studio

```bash
npm run db:studio
```

Abre interfaz visual en http://localhost:5555

## Despliegue

Ver documentación específica en `/docs/DEPLOYMENT.md`

## Troubleshooting

### Puerto 5432 (PostgreSQL) ya en uso
```bash
# Cambiar puerto en docker-compose.yml o matar proceso
lsof -ti:5432 | xargs kill -9
```

### Base de datos no sincronizada
```bash
npm run db:migrate:dev
npm run db:seed
```

### Limpiar todo y comenzar de cero
```bash
npm run docker:down
npm run docker:up
npm run setup
```

## Próximos Pasos

1. Revisar `/docs/ARCHITECTURE.md` para entender la estructura
2. Leer guías de cada módulo en `/apps/backend/src/*/README.md`
3. Comenzar con la Fase 2: Backend Core

---

**¿Preguntas?** Ver `/docs/README.md` para más información.
