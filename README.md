# Sweet Grace – E-commerce de Galletas Personalizadas

Plataforma completa de comercio electrónico para venta de galletas personalizadas con previsualización en tiempo real, carrito dinámico y checkout seguro.

## 🏗️ Estructura del Proyecto

```
sweet-grace-shop/
├── apps/
│   ├── frontend/          # Next.js 14 + TypeScript + Tailwind
│   └── backend/           # NestJS + TypeScript
├── packages/
│   └── shared/            # Tipos compartidos, utilidades
├── docs/                  # Documentación
├── .github/workflows/     # CI/CD
├── docker-compose.yml     # Desarrollo local
└── README.md
```

## 🚀 Quick Start

### Requisitos
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+ (o usar Docker)

### Instalación

```bash
# Clonar y entrar en el directorio
cd sweet-grace-shop

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local

# Iniciar PostgreSQL y servicios locales
docker-compose up -d

# Ejecutar migraciones
npm run db:migrate

# Iniciar frontend y backend en desarrollo
npm run dev
```

Visita:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- API Docs: http://localhost:3001/api

## 📦 Stack Tecnológico

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Three Fiber (3D)
- Zustand (state management)
- Zod (validación)

### Backend
- NestJS
- TypeScript
- Prisma (ORM)
- PostgreSQL
- Stripe/MercadoPago

### DevOps
- Docker & Docker Compose
- GitHub Actions (CI/CD)
- Railway (backend)
- Vercel (frontend)
- Neon (PostgreSQL)

## 📋 Fases de Implementación

### ✅ Fase 1 – Infraestructura y Base (esta semana)
- Estructura monorepo
- Modelos de datos (Prisma)
- CI/CD básico
- Docker setup

### 🔄 Fase 2 – Backend Core (semana 2)
- CRUD de productos
- Módulo de carrito (backend state)
- Módulo de pedidos
- Validaciones

### 🔄 Fase 3 – Pagos e Integración (semana 3)
- Stripe integration
- Webhooks de pago
- Sistema de emails (Resend)

### 🔄 Fase 4 – Frontend (semana 4)
- Catálogo y detalles
- Personalización (canvas)
- Carrito dinámico
- Checkout

### 🔄 Fase 5 – Admin y Producción (semana 5-6)
- Panel administrativo
- Monitoreo
- Despliegues

## 🔐 Seguridad

- ✅ HTTPS en producción
- ✅ Validación en frontend y backend
- ✅ Protección PCI DSS (Stripe/MercadoPago)
- ✅ Rate limiting
- ✅ Secretos en variables de entorno
- ✅ Validación de JWT/sesiones

## 📊 Reglas de Negocio

- **Precio base:** Por categoría y producto
- **Express (+50%):** Recargo por entrega en 24h
- **Límites:** 1-100 galletas, texto max 20 caracteres, imágenes max 5MB
- **Formas de pago:** Stripe (tarjeta, Apple Pay, Google Pay)

## 📞 Contacto

Email: sblocksmith796@gmail.com

---

**Status actual:** 🟢 En construcción – Fase 1
