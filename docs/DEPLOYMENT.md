# 🚀 Deployment Guide

## Arquitectura de Producción

```
┌─────────────────────────────────────────────────────┐
│                  Vercel (Frontend)                  │
│  - Next.js 14 SSR/SSG                              │
│  - Global CDN                                       │
│  - Auto SSL                                         │
│  - Environment: Production                          │
└──────────────────┬──────────────────────────────────┘
                   │ HTTPS
                   ▼
┌─────────────────────────────────────────────────────┐
│                Railway (Backend)                    │
│  - NestJS API                                       │
│  - Node.js 18+ runtime                             │
│  - Auto-scaling                                     │
│  - Health checks                                    │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│              Neon PostgreSQL                        │
│  - Managed database                                 │
│  - Auto-backups                                     │
│  - Read replicas                                    │
│  - Connection pooling                               │
└─────────────────────────────────────────────────────┘

External Services:
├─ Stripe (Payments)
├─ Resend (Emails)
├─ Cloudflare R2 (Files)
└─ Cloudflare DNS
```

---

## 1️⃣ Setup Neon PostgreSQL

### Paso 1: Crear cuenta en Neon
1. Ir a [neon.tech](https://neon.tech)
2. Sign up con email
3. Crear proyecto

### Paso 2: Obtener CONNECTION_STRING
```
postgres://user:password@host/dbname?sslmode=require
```

### Paso 3: Guardar en Railway secrets
```
DATABASE_URL=postgres://...
```

---

## 2️⃣ Setup Railway Backend

### Paso 1: Conectar GitHub
1. Ir a [railway.app](https://railway.app)
2. Sign up con GitHub
3. Autorizar acceso

### Paso 2: Crear nuevo proyecto
```
New Project → GitHub Repo → Select sweet-grace-shop
```

### Paso 3: Configurar servicio NestJS
```
Environment: Production
Builder: Dockerfile
Root: ./apps/backend/

Port: 3001
Health Check: /health
```

### Paso 4: Configurar variables de entorno
```
NODE_ENV=production
PORT=3001
DATABASE_URL=postgres://... (from Neon)

STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@sweetgrace.com
ADMIN_EMAIL=admin@sweetgrace.com

JWT_SECRET=<generate-strong-secret>
JWT_EXPIRATION=7d
BCRYPT_ROUNDS=12

AWS_REGION=auto
AWS_ACCESS_KEY_ID=<r2-key>
AWS_SECRET_ACCESS_KEY=<r2-secret>
AWS_S3_BUCKET=sweet-grace-prod
AWS_S3_ENDPOINT=https://xxx.r2.cloudflarestorage.com

NEXT_PUBLIC_API_URL=https://api.sweetgrace.com
```

### Paso 5: Deploy
```
Push a main branch → Railway auto-deploys
```

**API URL:** `https://<railway-app>.up.railway.app`

---

## 3️⃣ Setup Vercel Frontend

### Paso 1: Conectar GitHub
1. Ir a [vercel.com](https://vercel.com)
2. Sign up con GitHub
3. Import proyecto

### Paso 2: Seleccionar repo
```
Select: sweet-grace-shop
```

### Paso 3: Configurar build
```
Framework: Next.js
Root Directory: ./apps/frontend
Node Version: 18.x
```

### Paso 4: Environment variables
```
NEXT_PUBLIC_API_URL=https://api.sweetgrace.com
NEXT_PUBLIC_SITE_NAME=Sweet Grace
NEXT_PUBLIC_SITE_URL=https://sweetgrace.com
```

### Paso 5: Deploy
```
Vercel auto-deploys en push a main
```

**Frontend URL:** `https://sweetgrace.vercel.app`

---

## 4️⃣ Setup DNS con Cloudflare

### Paso 1: Registrar dominio
```
Comprar: sweetgrace.com (Namecheap, Route53, etc)
```

### Paso 2: Cambiar nameservers a Cloudflare
```
Ir a Cloudflare → Add Site
Cambiar nameservers en registrador
```

### Paso 3: Configurar registros DNS
```
CNAME  sweetgrace.com     → cname.vercel-dns.com
CNAME  api                → cname.railway.app
CNAME  www                → sweetgrace.com
```

### Paso 4: SSL/TLS
```
SSL/TLS Mode: Full (strict)
Auto Renew: ✓
```

---

## 5️⃣ Migraciones de BD en Producción

### Paso 1: Conectar a Neon
```bash
DATABASE_URL=postgres://... npx prisma migrate deploy
```

### Paso 2: Seed (opcional)
```bash
DATABASE_URL=postgres://... npm run db:seed
```

---

## 6️⃣ Configurar Stripe para Producción

### Paso 1: Crear cuenta Stripe
1. Ir a [stripe.com](https://stripe.com)
2. Sign up
3. Verificar identidad

### Paso 2: Obtener claves LIVE
```
Settings → API Keys
- Publishable: pk_live_...
- Secret: sk_live_...
- Webhook: whsec_...
```

### Paso 3: Guardar en Railway secrets
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLIC_KEY=pk_live_...
```

### Paso 4: Configurar webhooks
```
Endpoint: https://api.sweetgrace.com/payments/webhook
Events:
  - payment_intent.succeeded
  - payment_intent.payment_failed
  - charge.refunded
```

---

## 7️⃣ Configurar Resend para Emails

### Paso 1: Crear cuenta Resend
1. Ir a [resend.com](https://resend.com)
2. Sign up
3. Verificar dominio

### Paso 2: Obtener API Key
```
Settings → API Keys → Generate
```

### Paso 3: Guardar en Railway secrets
```
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@sweetgrace.com
```

### Paso 4: Verificar SPF/DKIM
```
DNS Records:
- SPF: v=spf1 include:resend.com ~all
- DKIM: <from-resend>
```

---

## 8️⃣ Configurar Cloudflare R2 (Almacenamiento)

### Paso 1: Crear bucket R2
```
R2 → Create Bucket → sweet-grace-prod
```

### Paso 2: Obtener credentials
```
Account ID: <account-id>
Access Key: <key-id>
Secret Key: <secret-key>
```

### Paso 3: Guardar en Railway secrets
```
AWS_S3_BUCKET=sweet-grace-prod
AWS_S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
AWS_ACCESS_KEY_ID=<key-id>
AWS_SECRET_ACCESS_KEY=<secret-key>
AWS_REGION=auto
```

### Paso 4: Configurar CORS
```
CORS Configuration:
- Allowed Origins: https://sweetgrace.com
- Allowed Methods: GET, PUT, POST, DELETE
- Allowed Headers: *
```

---

## ✅ Checklist de Deployment

- [ ] Neon DB creada y migrada
- [ ] Railway backend deployed
- [ ] Vercel frontend deployed
- [ ] Cloudflare DNS configurado
- [ ] Dominio funcionando (https://sweetgrace.com)
- [ ] Stripe webhooks configurados
- [ ] Resend emails enviando
- [ ] R2 bucket creado y conectado
- [ ] Variables de entorno todas seteadas
- [ ] Logs monitoreados (Railway + Vercel)
- [ ] Health check: /health respondiendo
- [ ] API funcionando: GET /products/categories
- [ ] Frontend cargando

---

## 🔐 Comandos Pre-Deploy

```bash
# Verificar que todo compila
npm run build --workspaces

# Verificar tipos
npm run type-check

# Lint
npm run lint

# Tests
npm run test

# Git push
git push origin main
```

---

## 📊 Monitoreo Post-Deploy

### Railway Monitoring
- Dashboard → Metrics
- Logs → buscar errores
- Deployments → ver historial

### Vercel Monitoring
- Dashboard → Analytics
- Deployments → ver builds
- Edge Functions → rendimiento

### Alertas (Sentry/Datadog)
```
Configurar cuando sea necesario escalabilidad
```

---

## 🆘 Troubleshooting

### Railway: Aplicación no inicia
```bash
# Revisar logs
railway logs

# Verificar comando start
npm run start --workspace=@sweet-grace/backend

# Verificar puerto
PORT=3001
```

### Vercel: Build falla
```bash
# Revisar build logs
Deployments → Failed → View Logs

# Verificar variables
Settings → Environment Variables
```

### Stripe webhooks no funcionan
```bash
# Escuchar webhooks localmente
stripe listen --forward-to localhost:3001/payments/webhook

# Trigger evento
stripe trigger payment_intent.succeeded
```

### Base de datos rechaza conexiones
```bash
# Verificar DATABASE_URL
echo $DATABASE_URL

# Test conexión
psql $DATABASE_URL -c "SELECT 1"
```

---

## 📝 URLs Producción

- **Frontend:** https://sweetgrace.com
- **API Docs:** https://api.sweetgrace.com/api
- **Health:** https://api.sweetgrace.com/health

---

## 🔄 CI/CD Automático

En main branch:

```
Push → GitHub Actions
  ├─ Lint ✓
  ├─ Test ✓
  ├─ Build ✓
  └─ Deploy
    ├─ Railway auto-deploys backend
    └─ Vercel auto-deploys frontend
```

---

**Estimated Setup Time:** 1-2 horas
**Cost/Month:** ~$50-100 (variable según uso)
