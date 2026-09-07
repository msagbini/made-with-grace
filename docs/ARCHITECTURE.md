# 🏗️ Arquitectura del Sistema

## Visión General

Sweet Grace es una plataforma de e-commerce modular y escalable para venta de galletas personalizadas.

```
┌─────────────────┐         ┌──────────────────┐
│  Frontend       │         │  Admin Panel     │
│  (Next.js)      │         │  (Futuro)        │
└────────┬────────┘         └──────────────────┘
         │
         │ REST API (JSON)
         ▼
┌──────────────────────────────────────────────┐
│  Backend API (NestJS)                        │
├──────────────────────────────────────────────┤
│ ├─ Products Module                           │
│ ├─ Orders Module                             │
│ ├─ Payments Module (Stripe)                  │
│ ├─ Files Module (R2/S3)                      │
│ ├─ Email Module (Resend)                     │
│ ├─ Auth Module                               │
│ └─ Health Module                             │
└────────┬─────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────┐
│  PostgreSQL Database                         │
│  (Prisma ORM)                                │
└──────────────────────────────────────────────┘

External Services:
├─ Stripe (Pagos)
├─ Resend (Emails)
├─ Cloudflare R2 (Almacenamiento)
└─ Sentry (Monitoreo)
```

## Capas de Arquitectura

### 1. Frontend (Next.js 14)

**Ubicación:** `/apps/frontend`

**Responsabilidades:**
- UI responsiva y accesible
- Gestión de estado (Zustand)
- Previsualización de productos (canvas 2D, Three.js 3D)
- Carrito del cliente
- Checkout
- SEO y Meta tags

**Tecnologías:**
- React 18
- TypeScript
- Tailwind CSS
- Three.js + React Three Fiber (3D)
- Zod (validaciones)
- Axios (HTTP client)

### 2. Backend (NestJS)

**Ubicación:** `/apps/backend`

**Responsabilidades:**
- REST API
- Lógica de negocio
- Validaciones server-side
- Integración con pasarelas de pago
- Gestión de emails
- Almacenamiento de archivos
- Autenticación y autorización

**Arquitectura Modular:**

```
src/
├── products/          # Catálogo
├── orders/            # Gestión de pedidos
├── payments/          # Pagos (Stripe/MercadoPago)
├── files/             # Subida de archivos
├── email/             # Envío de emails
├── auth/              # Autenticación
├── health/            # Health checks
└── shared/            # DTOs, decoradores, etc.
```

**Patrón de módulo:**

Cada módulo sigue: `Controller → Service → Repository (Prisma)`

```
├── xxx.module.ts      # Definición del módulo
├── xxx.controller.ts  # Endpoints HTTP
├── xxx.service.ts     # Lógica de negocio
└── dto/               # Data Transfer Objects
```

### 3. Base de Datos (PostgreSQL)

**ORM:** Prisma

**Entidades principales:**
- `Category` - Categorías de productos
- `Product` - Productos
- `Customer` - Clientes
- `Order` - Pedidos
- `OrderItem` - Items de pedidos
- `Payment` - Pagos realizados
- `File` - Archivos subidos
- `AdminUser` - Usuarios admin

**Características:**
- Migraciones versionadas
- Índices optimizados
- Constraints de integridad
- Backups automáticos (producción)

### 4. Almacenamiento de Archivos

**Proveedor:** Cloudflare R2 (o AWS S3)

**Casos de uso:**
- Imágenes subidas por usuarios
- Mockups/previsualizaciones generadas
- Assets estáticos

**Flujo:**
1. Cliente sube archivo
2. Backend valida (tipo, tamaño, etc.)
3. Backend envía a R2/S3
4. URL se guarda en BD
5. CDN sirve desde R2/S3

### 5. Pagos

**Proveedores:** Stripe (por defecto)

**Flujo:**
1. Frontend crea `PaymentIntent` en el backend
2. Backend llamaa Stripe API
3. Frontend redirige a Stripe Checkout
4. Stripe procesa pago
5. Stripe envía webhook al backend
6. Backend crea `Order` con estado `PAID`
7. Backend envía confirmación por email
8. Admin recibe notificación

**Seguridad:**
- PCI DSS delegado a Stripe
- No almacenar datos de tarjetas
- Webhook validation con firma Stripe

### 6. Emails

**Proveedor:** Resend

**Tipos:**
- Confirmación de pedido
- Notificación al admin
- Recordatorio de carrito abandonado (futuro)
- Cambios de estado de pedido

**Plantillas:**
- HTML responsivo
- Variables dinámicas
- SPF/DKIM/DMARC configurado

## Flujos Principales

### Flujo de Compra (Happy Path)

```
1. Usuario explora catálogo (GET /products)
2. Selecciona categoría (GET /products/categories/:slug)
3. Personaliza producto (cliente-side)
4. Añade al carrito (estado Zustand, localStorage)
5. Modifica carrito si es necesario
6. Procede a checkout
7. POST /orders con datos del cliente
8. POST /payments/intent para crear PaymentIntent
9. Frontend redirige a Stripe Checkout
10. Usuario completa pago en Stripe
11. Stripe webhook → backend crea Order pagado
12. Resend envía confirmación por email
13. Frontend muestra pantalla de gracias
```

### Flujo de Subida de Imagen

```
1. Usuario selecciona archivo en personalización
2. POST /files/upload con multipart/form-data
3. Backend valida (tipo, tamaño, contenido)
4. Backend sube a R2 (con virus scan opcional)
5. Backend retorna URL
6. Frontend muestra preview en canvas
```

### Flujo de Admin (futuro)

```
1. Admin login con credenciales
2. JWT token generado
3. Admin ve lista de pedidos
4. Admin actualiza estado: PENDING → CONFIRMED → IN_PRODUCTION → etc.
5. Sistema envía email de cambio de estado a cliente
6. Admin genera reportes/analytics
```

## Decisiones de Diseño

### Monolito vs Microservicios

**Decisión:** Monolito modular (por ahora)

**Justificación:**
- Más simple de desarrollar y desplegar
- Suficiente para Fase 1-3
- Modular para migrar a microservicios si escala
- Menor overhead operacional

### Base de datos única

**Decisión:** PostgreSQL centralizada

**Justificación:**
- Integridad transaccional crítica para pedidos/pagos
- Relaciones normalizadas
- ACID guarantees
- Fácil de respaldar

### JWT + REST (no GraphQL)

**Decisión:** REST + JWT

**Justificación:**
- Más simple para empezar
- Mejor caché HTTP
- Webhooks de Stripe vienen como REST
- GraphQL no agrega valor en MVP

### Canvas 2D + Three.js 3D

**Decisión:** Ambos (cargas diferidas)

**Justificación:**
- Canvas 2D para preview rápido (no necesita GPU)
- Three.js 3D para experiencia premium (lazy load)
- No afecta rendimiento inicial

## Escalabilidad

### Phase 1 (MVP)
- Single backend instance
- Single DB instance
- Basic monitoring

### Phase 2 (Growth)
- Backend horizontal scaling (replicas)
- DB read replicas
- Redis caching
- CDN para assets estáticos

### Phase 3 (Scale)
- Microservicios (if needed)
- Message queue (BullMQ/RabbitMQ)
- Multi-region deployment
- Database sharding

## Seguridad

### Autenticación
- JWT para API
- Clientes: sin autenticación requerida (futuro opcional)
- Admin: 2FA recomendado

### Autorización
- Middleware RBAC
- Principio de mínimo privilegio

### Validación
- Zod + class-validator
- Server-side siempre
- Sanitización de inputs

### Datos Sensibles
- TLS en tránsito
- Cifrado en reposo (BD gestionada)
- No almacenar tarjetas (Stripe)
- Secretos en env vars

## Monitoreo y Observabilidad

### Logging
- Pino (backend)
- Niveles: info, warn, error
- Correlation IDs

### Metrics
- CPU, memoria, latencia
- Pedidos creados/día
- Tasa de conversión

### Alertas
- Error rate > 1%
- Latencia p95 > 500ms
- Disponibilidad < 99.9%

### Trazas Distribuidas
- OpenTelemetry (futuro)
- Frontend → API → DB

## Deployment

### Entornos

```
Development (local)
    ↓
Staging (replica producción con datos ficticios)
    ↓
Production (real)
```

### CI/CD

```
Push → GitHub Actions
    ├─ Lint
    ├─ Test
    ├─ Build
    └─ Deploy (automático a staging, manual a prod)
```

### Infraestructura

```
Vercel (frontend)
Railway/Fly.io (backend)
Neon/Supabase (PostgreSQL)
Cloudflare (CDN + DNS)
Stripe/Resend (servicios externos)
```

---

**Proximos:** Ver `/docs/API.md` para especificación de endpoints.
