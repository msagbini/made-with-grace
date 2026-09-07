# 🔐 Deployment Credentials Template

**Purpose:** Reference guide for all credentials needed in production  
**Security:** Never commit this file with actual values; use password manager or secure vault  
**Updated:** 2026-09-07

---

## Overview

This document lists all credentials and API keys needed to deploy Sweet Grace to production. Print this template and fill it in as you set up each service.

**Important:**
- Use a password manager (1Password, LastPass, Bitwarden) or secure vault
- Never commit filled credentials to Git
- Add this file to `.gitignore` if you save actual values
- Rotate credentials every 6 months
- Different dev/staging/production keys for each service

---

## Checklist Template

Use this table to track which credentials you've gathered:

| Service | Credential | Format | Status | Obtained On | Notes |
|---------|-----------|--------|--------|-------------|-------|
| Neon | Connection String | postgresql://user:pass@host/db | [ ] | | Includes password |
| Railway | Project ID | xxxxx | [ ] | | For CLI (optional) |
| Railway | Service Token | xxxxx | [ ] | | For CI/CD (optional) |
| Vercel | Project ID | xxxx | [ ] | | Auto-generated |
| Stripe | Publishable Key (LIVE) | pk_live_... | [ ] | | For frontend |
| Stripe | Secret Key (LIVE) | sk_live_... | [ ] | | For backend - SECRET |
| Stripe | Webhook Secret | whsec_... | [ ] | | For payment webhooks |
| Resend | API Key | re_... | [ ] | | For sending emails |
| Cloudflare | Account ID | 32-char hex | [ ] | | For R2 access |
| Cloudflare | R2 Access Key | 20-char code | [ ] | | For file storage |
| Cloudflare | R2 Secret Key | 40-char secret | [ ] | | For R2 - SECRET |
| Domain | Registrar | (e.g., GoDaddy) | [ ] | | Where domain registered |
| Domain | Nameservers | 2-4 values | [ ] | | For DNS |

---

## 1. Database (Neon PostgreSQL)

### Connection String

```
DATABASE_URL=postgresql://[USER]:[PASSWORD]@[HOST]/[DBNAME]?sslmode=require
```

| Component | Value | Notes |
|-----------|-------|-------|
| **USER** | neon_user | Default username from Neon |
| **PASSWORD** | (your-neon-password) | Keep secret - never log this |
| **HOST** | ep-xxxxx.us-east-2.neon.tech | Region-specific endpoint |
| **DBNAME** | neon_db_name | Main production database |
| **sslmode** | require | Always required for Neon |

**Full Example:**
```
DATABASE_URL=postgresql://neon_user:abc123XYZ@ep-cool-wave-12345.us-east-2.neon.tech/production?sslmode=require
```

**Where to get:**
1. Go to neon.tech dashboard
2. Select your project
3. Click **Connection String**
4. Select **Nodejs** from dropdown
5. Copy entire string

**Where to use:**
- Railway backend environment variables
- Local testing (if needed)

---

## 2. Authentication & JWT

### JWT Secret

```
JWT_SECRET=[GENERATE-NEW-STRONG-SECRET]
```

**Requirements:**
- Minimum 32 characters
- Random alphanumeric + symbols
- Should NOT be reused from dev
- Store in Railway only (not in code)

**Generate using:**

```bash
# macOS/Linux
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Online tool (if no CLI access)
https://www.random.org/strings/
(32 characters, alphanumeric + symbols)
```

**Example:**
```
JWT_SECRET=kX9mL2pQvR4tW7sJ1yF8gH3nC6eU0dA5
```

**Where to use:**
- Railway backend environment variables

### JWT Expiration

```
JWT_EXPIRATION=7d
```

**Options:**
- `7d` = 7 days (recommended for mobile)
- `30d` = 30 days (longer sessions)
- `1h` = 1 hour (short-lived, most secure)

---

## 3. Payments (Stripe)

### Publishable Key (LIVE)

```
NEXT_PUBLIC_STRIPE_KEY=pk_live_[YOUR_KEY]
```

**Format:** Starts with `pk_live_`, ~51 characters  
**Visibility:** Safe to expose in frontend  
**Location:** [dashboard.stripe.com](https://dashboard.stripe.com) → Developers → API Keys

**Example:**
```
pk_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```
(Get your actual key from dashboard.stripe.com)

**Where to use:**
- Vercel frontend environment variables (visible in browser)
- Frontend code for Stripe elements

### Secret Key (LIVE)

```
STRIPE_SECRET_KEY=sk_live_[YOUR_SECRET]
```

**Format:** Starts with `sk_live_`, ~48 characters  
**Visibility:** KEEP SECRET - only backend  
**Location:** [dashboard.stripe.com](https://dashboard.stripe.com) → Developers → API Keys

**Example:**
```
sk_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```
(Get your actual key from dashboard.stripe.com)

**Security:**
- Never expose in frontend
- Only in backend (Railway)
- Rotate if accidentally exposed
- Use different key for staging

**Where to use:**
- Railway backend environment variables ONLY

### Webhook Secret

```
STRIPE_WEBHOOK_SECRET=whsec_[YOUR_WEBHOOK_SECRET]
```

**Format:** Starts with `whsec_`, ~38 characters  
**Purpose:** Validates webhooks from Stripe  
**Location:** [dashboard.stripe.com](https://dashboard.stripe.com) → Developers → Webhooks → Your Endpoint → Signing Secret

**Note:** Get your actual key from Stripe dashboard

**Security:**
- Only used for webhook validation
- Different key per webhook endpoint
- Keep in backend only

**Where to use:**
- Railway backend environment variables
- Webhook handler in backend code

### Stripe Account Info

| Item | Value | Notes |
|------|-------|-------|
| **Account Email** | [your-email] | For Stripe account login |
| **Business Name** | Sweet Grace | For receipts/statements |
| **Live Mode Enabled** | YES | Must be live for production |

---

## 4. Email (Resend)

### API Key

```
RESEND_API_KEY=re_[YOUR_API_KEY]
```

**Format:** Starts with `re_`, ~30+ characters  
**Location:** [resend.com](https://resend.com) → API Keys → Create API Key

**Note:** Get your actual key from resend.com dashboard

**Security:**
- Different key for production/development
- Regenerate if exposed
- Store in backend only

**Where to use:**
- Railway backend environment variables

### From Email Address

```
RESEND_FROM_EMAIL=noreply@sweetgrace.com
```

**Requirements:**
- Must be verified domain (sweetgrace.com)
- Usually `noreply@` for transactional emails
- Must match domain configured in Resend

**Where to use:**
- Railway backend environment variables
- Email templates in backend

### Admin Notification Email

```
ADMIN_EMAIL=admin@sweetgrace.com
```

**Purpose:** Receives order notifications  
**Requirements:**
- Can be any valid email address
- Doesn't need domain verification
- Gmail, company email, etc. are fine

**Where to use:**
- Railway backend environment variables
- Backend logic for admin notifications

### Domain Verification

After adding domain to Resend, you'll need DNS records:

| Record | Type | Value | Status |
|--------|------|-------|--------|
| SPF | TXT | v=spf1 include:resend.com ~all | [ ] Verified |
| DKIM (default) | CNAME | default._domainkey → resend.dev | [ ] Verified |
| DMARC (optional) | TXT | v=DMARC1; p=quarantine... | [ ] Added |
| MX (if not already set) | MX | mx1.resend.dev | [ ] Added |

**Setup process:**
1. Add domain in Resend dashboard
2. Copy DNS records shown
3. Add to your domain provider (GoDaddy, Cloudflare, etc.)
4. Wait 15-30 minutes for DNS propagation
5. Click "Verify Domain" in Resend
6. Wait for green checkmarks

---

## 5. File Storage (Cloudflare R2)

### Account ID

```
AWS_ACCOUNT_ID=[YOUR_ACCOUNT_ID]
```

**Format:** 32-character hex string (lowercase)  
**Location:** [Cloudflare Dashboard](https://dash.cloudflare.com) → R2 → Copy Account ID

**Example:**
```
1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p
```

### R2 Access Key ID

```
AWS_ACCESS_KEY_ID=[YOUR_ACCESS_KEY]
```

**Format:** ~20-character alphanumeric  
**Location:** Cloudflare → R2 Settings → API Tokens → Create API Token

**Example:**
```
c9e3b6f2a1d4e7c0b3f6
```

**Visibility:** Similar to username, but keep secure

### R2 Secret Access Key

```
AWS_SECRET_ACCESS_KEY=[YOUR_SECRET_KEY]
```

**Format:** ~40-character alphanumeric  
**Location:** Cloudflare → Only shown once during creation

**Example:**
```
9f8e7d6c5b4a3z2y1x0w9v8u7t6s5r4q3p2o1n0m
```

**Security:**
- KEEP SECRET - store securely
- Only shown once during creation
- Cannot be retrieved after (regenerate if lost)
- Rotate every 6 months

### R2 Bucket Name

```
AWS_S3_BUCKET=sweet-grace-prod
```

**Requirements:**
- Lowercase alphanumeric + hyphens
- 3-63 characters
- Must be globally unique (probably not relevant for R2)
- Created in Cloudflare R2 dashboard

### R2 Endpoint URL

```
AWS_S3_ENDPOINT=https://[ACCOUNT_ID].r2.cloudflarestorage.com
```

**Format:**
```
https://1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p.r2.cloudflarestorage.com
```

**Note:**
- Replace `[ACCOUNT_ID]` with your actual Account ID
- Always use `r2.cloudflarestorage.com` (not `cloudstorage`)
- Use HTTPS only

### AWS Region

```
AWS_REGION=auto
```

**For R2:** Always use `auto` (R2 handles routing)

---

## 6. Frontend (Vercel)

### Project Name

```
PROJECT_NAME=sweet-grace-shop
```

**From:** Vercel dashboard → Project name

### Project ID

```
VERCEL_PROJECT_ID=[AUTO-GENERATED]
```

**Purpose:** For Vercel CLI (optional)  
**Location:** Vercel dashboard → Settings → General → Project ID

**Example:**
```
prj_abc123XYZ1234567890
```

### Build Settings

| Setting | Value | Notes |
|---------|-------|-------|
| **Framework** | Next.js | Auto-detected |
| **Root Directory** | ./apps/frontend | Monorepo |
| **Build Command** | npm run build --workspace=@sweet-grace/frontend | |
| **Node Version** | 18.x or 20.x | Latest LTS |

---

## 7. Backend (Railway)

### Project ID

```
RAILWAY_PROJECT_ID=[AUTO-GENERATED]
```

**Purpose:** For Railway CLI  
**Location:** Railway dashboard → Project settings

**Example:**
```
proj_abc123xyz
```

### Service Token

```
RAILWAY_TOKEN=[OPTIONAL]
```

**Purpose:** For CI/CD automation (GitHub Actions)  
**Location:** Railway dashboard → Account Settings → API Tokens

**When needed:** Only if using Railway CLI or CI/CD

---

## 8. Domain & DNS

### Domain Name

```
DOMAIN=sweetgrace.com
```

**Registrar Options:**
- GoDaddy
- Namecheap
- Google Domains
- Route53 (AWS)
- Other registrar

### Nameservers (if using Cloudflare)

```
ns1.cloudflare.com
ns2.cloudflare.com
```

**Purpose:** Points domain to Cloudflare DNS  
**Where to set:** Your domain registrar's nameserver settings

### DNS Records to Create

| Subdomain | Type | Value | Purpose |
|-----------|------|-------|---------|
| @ (root) | CNAME | cname.vercel-dns.com | Frontend |
| www | CNAME | sweetgrace.com | Frontend alias |
| api | CNAME | cname.railway.app | Backend API |

**Note:** Exact CNAME values from Vercel and Railway dashboards

---

## 9. Optional: Monitoring & Error Tracking

### Sentry (Error Tracking)

```
SENTRY_DSN=https://[KEY]@sentry.io/[PROJECT_ID]
```

**Location:** sentry.io → Project Settings → Client Keys (DSN)

**Example:**
```
SENTRY_DSN=https://abc123xyz@o12345.ingest.sentry.io/6789012
```

**Where to use:**
- Railway backend (optional)

### PostHog (Analytics)

```
POSTHOG_API_KEY=[YOUR_KEY]
POSTHOG_ENDPOINT=https://app.posthog.com
```

**Location:** PostHog dashboard → Project settings  
**Where to use:** Frontend and backend (optional)

---

## Credentials Inventory

### By Service

**Neon (Database)**
- [ ] Connection String

**Railway (Backend)**
- [ ] Project ID
- [ ] Service Token (optional)
- [ ] All environment variables (see .env.production.example)

**Vercel (Frontend)**
- [ ] Project ID
- [ ] Project access token (optional)

**Stripe (Payments)**
- [ ] Publishable Key
- [ ] Secret Key
- [ ] Webhook Secret

**Resend (Email)**
- [ ] API Key
- [ ] Domain verified (SPF, DKIM)

**Cloudflare (R2 Storage)**
- [ ] Account ID
- [ ] Access Key ID
- [ ] Secret Access Key
- [ ] Bucket name

**Domain**
- [ ] Registrar account access
- [ ] Nameservers configured
- [ ] DNS records created

### By Platform

**Railway Backend Environment:**
```
NODE_ENV
PORT
DEBUG
DATABASE_URL
JWT_SECRET
JWT_EXPIRATION
BCRYPT_ROUNDS
STRIPE_SECRET_KEY
STRIPE_PUBLIC_KEY
STRIPE_WEBHOOK_SECRET
RESEND_API_KEY
RESEND_FROM_EMAIL
ADMIN_EMAIL
AWS_REGION
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_S3_BUCKET
AWS_S3_ENDPOINT
NEXT_PUBLIC_API_URL
[Optional: SENTRY_DSN]
```

**Vercel Frontend Environment:**
```
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_SITE_NAME
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_STRIPE_KEY
```

---

## Security Checklist

- [ ] All credentials stored in password manager (not in Git)
- [ ] `.env.production` added to .gitignore
- [ ] No credentials logged in application
- [ ] HTTPS enabled for all endpoints
- [ ] CORS properly configured
- [ ] Database password is strong (12+ characters)
- [ ] JWT secret is cryptographically random
- [ ] Stripe webhook is validated
- [ ] Email domain is verified
- [ ] R2 credentials are rotated every 6 months
- [ ] Each service has different credentials for dev/prod
- [ ] CI/CD has restricted access to credentials

---

## Credential Rotation Schedule

Recommended rotation frequency:

| Credential | Rotation | Reason |
|-----------|----------|--------|
| JWT Secret | 1 year | Or if exposed |
| Stripe Keys | 2 years | Or if exposed |
| Resend API Key | 1 year | Or if exposed |
| R2 Access Keys | 6 months | Best practice |
| Database Password | 1 year | Or if exposed |

---

## Compromised Credential Response

If a credential is exposed:

1. **IMMEDIATELY:** Regenerate/revoke the key
2. **Verify:** Check logs for abuse
3. **Update:** Set new value in all systems
4. **Notify:** Inform team members
5. **Review:** Check what data may have been accessed
6. **Plan:** Implement additional safeguards

---

## Password Manager Integration

Recommended setup:

```
1Password / LastPass / Bitwarden
├── Sweet Grace - Production
│   ├── Neon Connection String
│   ├── Stripe API Keys
│   ├── Resend API Key
│   ├── Cloudflare R2 Keys
│   ├── JWT Secret
│   └── Domain Registrar
```

**Sharing with team:**
- Only share what people need
- Revoke access when team members leave
- Use read-only vaults when possible
- Audit access logs monthly

---

## Verification Checklist

Before claiming deployment is complete:

- [ ] All credentials obtained and stored securely
- [ ] All environment variables set in Railway
- [ ] All environment variables set in Vercel
- [ ] Database connection tested
- [ ] API keys tested with API calls
- [ ] Webhook endpoints verified
- [ ] Domain verified with email provider
- [ ] SSL certificates active on all domains
- [ ] Team members have necessary access
- [ ] Backup credentials stored safely
- [ ] Rotation schedule documented

---

**Last Updated:** 2026-09-07  
**Next Review Date:** [SET REMINDER FOR 6 MONTHS]

---

*Note: Use this as a reference during deployment. Fill in values as you obtain them, but always store actual credentials in a secure password manager, never in this Git repository.*

