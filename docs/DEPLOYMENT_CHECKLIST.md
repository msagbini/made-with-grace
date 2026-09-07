# 📋 Production Deployment Checklist - Sweet Grace

**Estimated Total Time:** 2-3 hours  
**Difficulty Level:** Intermediate  
**Last Updated:** 2026-09-07

This is a hands-on, step-by-step guide for deploying Sweet Grace to production. Each section includes exact commands, expected outputs, and troubleshooting tips.

---

## Table of Contents

1. [Pre-Deployment Checklist](#1-pre-deployment-checklist)
2. [Database Setup (Neon)](#2-database-setup-neon)
3. [Backend Deployment (Railway)](#3-backend-deployment-railway)
4. [Frontend Deployment (Vercel)](#4-frontend-deployment-vercel)
5. [Stripe Configuration](#5-stripe-configuration)
6. [Email Setup (Resend)](#6-email-setup-resend)
7. [Storage Setup (Cloudflare R2)](#7-storage-setup-cloudflare-r2)
8. [DNS Configuration](#8-dns-configuration)
9. [Post-Deployment Testing](#9-post-deployment-testing)
10. [Monitoring & Alerts](#10-monitoring--alerts)

---

## 1. Pre-Deployment Checklist

**Time Estimate:** 30 minutes  
**Prerequisites:** GitHub account, domain name (sweetgrace.com)

### 1.1 Code Verification

Before deploying, ensure the code is production-ready:

```bash
# Verify code compiles
npm run build --workspaces

# Expected output: ✓ Both apps build without errors
```

```bash
# Type check everything
npm run type-check

# Expected output: "No errors found"
```

```bash
# Run linter
npm run lint

# Expected output: "No eslint errors or warnings"
```

```bash
# Run tests
npm run test

# Expected output: "Tests pass" (or skip if none yet)
```

### 1.2 Git Setup

- [ ] Repository is public on GitHub (or access granted to third-party apps)
- [ ] Main branch is protected (requires pull requests)
- [ ] All code is committed and pushed:

```bash
git status

# Expected output: "nothing to commit, working tree clean"
```

### 1.3 Credentials to Gather

Create a spreadsheet or password manager entry with these credentials. You'll need them in the following steps:

| Service | Credential | Status | Notes |
|---------|-----------|--------|-------|
| Stripe | Publishable Key (pk_live_) | [ ] | From dashboard.stripe.com |
| Stripe | Secret Key (sk_live_) | [ ] | KEEP SECRET |
| Stripe | Webhook Secret | [ ] | whsec_... |
| Resend | API Key | [ ] | From resend.com dashboard |
| Resend | Domain (SPF, DKIM) | [ ] | To be verified |
| Neon | Connection String | [ ] | postgresql://... |
| Railway | Service Token | [ ] | For CLI (optional) |
| Cloudflare R2 | Account ID | [ ] | From Cloudflare dashboard |
| Cloudflare R2 | Access Key ID | [ ] | AWS_ACCESS_KEY_ID |
| Cloudflare R2 | Secret Key | [ ] | AWS_SECRET_ACCESS_KEY |
| Domain Registrar | Auth Code (if transferring) | [ ] | For domain ownership |

### 1.4 Domain Setup

- [ ] Domain name registered (sweetgrace.com) or ready to use
- [ ] Domain registrar account accessible
- [ ] Nameserver change capability confirmed (if using Cloudflare DNS)

---

## 2. Database Setup (Neon)

**Time Estimate:** 15 minutes  
**Cost:** Free tier available, $15/month for production

### 2.1 Create Neon Account & Project

1. Go to [neon.tech](https://neon.tech)
2. Click "Sign up"
3. Use GitHub or email
4. Create new project:
   - **Project name:** `sweet-grace-prod`
   - **Region:** Choose closest to your users (US-East recommended)
   - **PostgreSQL version:** Latest (15+)

### 2.2 Get Connection String

**Action:** After project creation, you'll see connection details.

1. In Neon dashboard, go to **Connection String**
2. Select **Nodejs** from dropdown
3. Copy the full connection string

**Expected format:**
```
postgresql://neon_user:neon_password@ep-xxxxx.us-east-2.neon.tech/neon_db_name?sslmode=require
```

**Important Notes:**
- The string includes password - treat as secret
- SSL mode is required (`?sslmode=require`)
- Note the database name (usually `neon_db_name` or custom)

### 2.3 Test Connection Locally

```bash
# Test connection from your machine (optional but recommended)
psql "postgresql://neon_user:password@ep-xxxxx.us-east-2.neon.tech/neon_db_name?sslmode=require" -c "SELECT 1"

# Expected output:
#  ?column?
# ----------
#         1
```

### 2.4 Create Production Database

In Neon dashboard:

1. Click **Branches** (if available, or skip this step)
2. Keep default main branch for production
3. Note the **database name** (you'll need it later)

### 2.5 Connection String Format Check

The connection string should be exactly:
```
postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require
```

- `USER`: Neon username (usually `neon_user`)
- `PASSWORD`: Your Neon password (save securely)
- `HOST`: `ep-xxxxx.us-east-2.neon.tech`
- `DBNAME`: Name of your database
- `sslmode=require`: Always include this

**Save this value as `DATABASE_URL` for the next steps.**

### 2.6 Troubleshooting

**Problem:** "Connection refused"
- Check firewall settings in Neon dashboard
- Ensure `sslmode=require` in connection string

**Problem:** "SSL: CERTIFICATE_VERIFY_FAILED"
- Add `?sslmode=require` to connection string
- Or use `?sslmode=prefer` if issues persist

---

## 3. Backend Deployment (Railway)

**Time Estimate:** 30 minutes  
**Cost:** $5-20/month depending on usage

### 3.1 Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Click "Login with GitHub"
3. Authorize Railway to access your repositories
4. On dashboard, click **"+ New Project"**

### 3.2 Connect GitHub Repository

1. Select **Deploy from GitHub repo**
2. Choose **sweet-grace-shop** repository
3. Confirm access permissions
4. Railway will analyze the repo structure

### 3.3 Create Backend Service

**Method A: Automatic Detection (Recommended)**

If Railway detects monorepo:
1. Select the backend root directory: `./apps/backend`
2. Railway will auto-detect NestJS
3. Confirm settings

**Method B: Manual Configuration**

If auto-detect fails:
1. Click **"+ Add Service"**
2. Select **Docker**
3. Set **Root Directory:** `./apps/backend`
4. Set **Port:** `3001`

### 3.4 Configure Environment Variables

**In Railway Dashboard:**

1. Open your backend service
2. Go to **Variables** tab
3. Add each variable (copy from .env.production.example):

```
NODE_ENV = production
PORT = 3001
DEBUG = false
```

**Database (from Neon step 2.5):**
```
DATABASE_URL = postgresql://user:password@host/dbname?sslmode=require
```

**JWT Security (generate new strong value):**
```
JWT_SECRET = <generate-strong-random-string-32-chars>
JWT_EXPIRATION = 7d
BCRYPT_ROUNDS = 12
```

**Stripe (you'll get these in section 5):**
```
STRIPE_SECRET_KEY = sk_live_... (will add after Stripe setup)
STRIPE_PUBLIC_KEY = pk_live_... (will add after Stripe setup)
STRIPE_WEBHOOK_SECRET = whsec_... (will add after Stripe setup)
```

**Resend Email (you'll get this in section 6):**
```
RESEND_API_KEY = re_... (will add after Resend setup)
RESEND_FROM_EMAIL = noreply@sweetgrace.com
ADMIN_EMAIL = admin@sweetgrace.com
```

**Cloudflare R2 Storage (you'll get these in section 7):**
```
AWS_REGION = auto
AWS_ACCESS_KEY_ID = (will add after R2 setup)
AWS_SECRET_ACCESS_KEY = (will add after R2 setup)
AWS_S3_BUCKET = sweet-grace-prod
AWS_S3_ENDPOINT = https://xxx.r2.cloudflarestorage.com
```

**Frontend URL (for CORS):**
```
NEXT_PUBLIC_API_URL = https://api.sweetgrace.com
```

### 3.5 Configure Health Check

1. In Railway service settings, find **Health Check** section
2. Set **Health Check Path:** `/health`
3. Expected HTTP status: **200**
4. Check interval: 30 seconds (default)

### 3.6 Initial Deploy

**Trigger deployment:**

Option 1: Push to main branch
```bash
git push origin main
```

Option 2: Manual trigger in Railway dashboard
- Click **"Deploy"** button
- Select commit to deploy
- Watch deployment logs

**Expected logs:**
```
Building image...
[✓] Image built successfully
Starting application...
[✓] Health check passed
Application running on port 3001
[✓] Deployment successful
```

### 3.7 Get Backend URL

After successful deploy:
1. In Railway dashboard, open your service
2. Look for **Service URL** or **Domain**
3. It will be something like: `https://sweet-grace-backend-prod.up.railway.app`
4. Note this URL - you'll need it for frontend setup

### 3.8 Test Backend Health

```bash
curl https://sweet-grace-backend-prod.up.railway.app/health

# Expected output:
# { "status": "ok", "timestamp": "2026-09-07T10:00:00.000Z" }
```

### 3.9 View Logs

**In Railway dashboard:**
1. Select your service
2. Click **Logs** tab
3. Watch real-time application logs
4. Look for errors starting with `[ERROR]`

**Common issues:**
- Database connection failed → check DATABASE_URL
- Port already in use → Railway automatically assigns port
- Missing env var → check all variables are set

### 3.10 Troubleshooting

**Problem:** "Build failed"
```
Solution:
1. Check build logs in Railway dashboard
2. Verify Dockerfile exists in apps/backend/
3. Ensure package.json scripts are correct:
   - npm run build (should create dist/)
   - npm run start (should run dist/main.js)
```

**Problem:** "Health check failing"
```
Solution:
1. Verify /health endpoint exists in code
2. Check backend is actually running:
   railway logs | grep "Health check"
3. May take 30 seconds to establish
```

**Problem:** "Database connection refused"
```
Solution:
1. Verify DATABASE_URL is correct:
   - Copy exact string from Neon dashboard
   - Ensure ?sslmode=require is present
2. Test connection locally:
   psql $DATABASE_URL -c "SELECT 1"
3. Check Neon network settings
```

---

## 4. Frontend Deployment (Vercel)

**Time Estimate:** 20 minutes  
**Cost:** Free tier available ($20/month for production features)

### 4.1 Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign up"
3. Select "Continue with GitHub"
4. Authorize Vercel to access repositories

### 4.2 Import Repository

1. On Vercel dashboard, click **"+ Add New"** → **"Project"**
2. Select **Import Git Repository**
3. Find and select **sweet-grace-shop**
4. Click **"Import"**

### 4.3 Configure Project

**Framework & Root Directory:**
- Framework: **Next.js** (auto-detected)
- Root Directory: `./apps/frontend`

**Build Settings:**
- Build Command: `npm run build --workspace=@sweet-grace/frontend`
- Output Directory: `.next`
- Install Command: `npm install`

### 4.4 Set Environment Variables

Click **"Environment Variables"** and add:

```
NEXT_PUBLIC_API_URL = https://api.sweetgrace.com
NEXT_PUBLIC_SITE_NAME = Sweet Grace
NEXT_PUBLIC_SITE_URL = https://sweetgrace.com
NEXT_PUBLIC_STRIPE_KEY = pk_live_... (add after Stripe setup)
```

**Important Notes:**
- Variables starting with `NEXT_PUBLIC_` are visible to browser
- Do NOT put secrets (API keys) here
- Set for Production environment

### 4.5 Deploy

**Method 1: Automatic (Recommended)**
- Vercel auto-deploys on push to main
- Deployment happens automatically

**Method 2: Manual Trigger**
- In Vercel dashboard, click **"Deploy"**
- Select branch and commit

**Expected logs:**
```
Building application...
[✓] Build completed successfully
Optimizing assets...
[✓] Assets optimized
Deploying to CDN...
[✓] Deployment successful
https://sweet-grace-shop.vercel.app
```

### 4.6 Get Frontend URL

After deployment:
- Default URL: `https://sweet-grace-shop.vercel.app`
- This is a preview URL; custom domain comes next

**Test the frontend loads:**
```bash
curl -I https://sweet-grace-shop.vercel.app

# Expected: HTTP/1.1 200 OK
```

### 4.7 Troubleshooting

**Problem:** "Build fails with 'module not found'"
```
Solution:
1. Check root package.json has workspaces defined
2. Verify all dependencies are in package.json
3. Review build logs for specific missing module
4. Run locally: npm run build --workspaces
```

**Problem:** "API calls return 404"
```
Solution:
1. Verify NEXT_PUBLIC_API_URL is set correctly
2. Check backend is actually deployed and running
3. Test backend health: curl https://api.sweetgrace.com/health
4. Check CORS is configured in backend
```

**Problem:** "Environment variables not being read"
```
Solution:
1. Verify they start with NEXT_PUBLIC_ for browser access
2. Redeploy after adding variables (env updates require redeploy)
3. Check in Vercel dashboard Settings → Environment Variables
4. Variables should show in production, preview, and development
```

---

## 5. Stripe Configuration

**Time Estimate:** 20 minutes  
**Cost:** 2.9% + $0.30 per transaction

### 5.1 Create Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Click **"Start now"**
3. Sign up with email
4. Verify email address
5. Complete account setup:
   - Business name: Sweet Grace
   - Business website: https://sweetgrace.com
   - Business type: Retail/E-commerce
6. Verify identity (may require document)

### 5.2 Get Live API Keys

1. In Stripe dashboard, go to **Developers** → **API Keys**
2. Toggle to **Live** keys (production)
3. Copy both keys:

**Publishable Key (for frontend):**
```
pk_live_... (51 characters, starts with pk_live)
```

**Secret Key (for backend):**
```
sk_live_... (KEEP THIS SECRET! 48+ characters, starts with sk_live)
```

### 5.3 Get Webhook Secret

1. In Stripe dashboard, go to **Developers** → **Webhooks**
2. Click **"Add Endpoint"**
3. Set **Endpoint URL:** `https://api.sweetgrace.com/payments/webhook`
4. Select **Events to send:**
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `charge.dispute.created`
5. Click **"Add endpoint"**
6. On the endpoint details page, find **Signing secret**:
```
whsec_... (starts with whsec_)
```

**IMPORTANT:** Webhook secret is sensitive - keep it secure

### 5.4 Update Backend Environment Variables

Now add Stripe keys to Railway:

1. Go to Railway dashboard
2. Open backend service → **Variables**
3. Add or update:

```
STRIPE_SECRET_KEY = sk_live_...
STRIPE_PUBLIC_KEY = pk_live_...
STRIPE_WEBHOOK_SECRET = whsec_...
```

4. Railway will auto-redeploy with new variables

### 5.5 Update Frontend Environment Variables

1. Go to Vercel dashboard
2. Open project → **Settings** → **Environment Variables**
3. Add or update:

```
NEXT_PUBLIC_STRIPE_KEY = pk_live_...
```

4. Redeploy to apply:
   - Push to main branch, or
   - Click **Redeploy** in Vercel dashboard

### 5.6 Test Stripe Integration

**Using Stripe Test Mode (keep test keys for local testing):**

1. In Stripe dashboard, use **Test** API Keys instead of Live
2. Use test card numbers:
   - Success: `4242 4242 4242 4242`
   - Fail: `4000 0000 0000 0002`
   - 3D Secure: `4000 0025 0000 3155`
3. Any expiration date in future
4. Any CVC

**Verify webhook:**

1. In Stripe dashboard → **Webhooks**
2. Click on your endpoint
3. Scroll to **Events**
4. Look for recent test payments
5. Click event to see details

**Expected webhook events:**
```json
{
  "id": "evt_...",
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_...",
      "status": "succeeded",
      "amount": 5000
    }
  }
}
```

### 5.7 Troubleshooting

**Problem:** "Webhook not being received"
```
Solution:
1. Verify endpoint URL is accessible:
   curl https://api.sweetgrace.com/payments/webhook
   (Should NOT return 404, may return 400 if no body)

2. Check webhook secret matches what's in Railway:
   STRIPE_WEBHOOK_SECRET should match Stripe dashboard

3. Review Stripe webhook logs for errors:
   Dashboard → Developers → Webhooks → your endpoint → Events

4. Test manually:
   stripe trigger payment_intent.succeeded
   (requires Stripe CLI)
```

**Problem:** "Payment fails with 'invalid_request_error'"
```
Solution:
1. Verify STRIPE_SECRET_KEY is set (not STRIPE_PUBLIC_KEY)
2. Check key format: should start with sk_live_
3. Ensure key is not truncated in env vars
4. Test with fresh key from Stripe dashboard
```

**Problem:** "Frontend doesn't recognize Stripe key"
```
Solution:
1. Verify NEXT_PUBLIC_STRIPE_KEY is set (in Vercel)
2. Check format: should start with pk_live_
3. Verify it starts with NEXT_PUBLIC_ (necessary for browser)
4. Redeploy after adding variable (env requires redeploy)
5. Hard refresh browser (Ctrl+Shift+R)
```

---

## 6. Email Setup (Resend)

**Time Estimate:** 25 minutes  
**Cost:** Free tier includes 100 emails/day; $20/month for higher limits

### 6.1 Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Click **"Get Started"**
3. Sign up with GitHub or email
4. Verify email

### 6.2 Get API Key

1. In Resend dashboard, go to **API Keys**
2. Click **"Create API Key"**
3. Name it: `sweet-grace-production`
4. Copy the key:

```
re_... (starts with re_)
```

**Keep this key secret!**

### 6.3 Verify Domain for Email

**This is critical for production emails - required for SPF/DKIM/DMARC.**

1. In Resend dashboard, go to **Domains**
2. Click **"Add Domain"**
3. Enter: `sweetgrace.com`
4. Click **"Add Domain"**
5. You'll see DNS records to add:

**DNS Records to Add to Your Domain:**

| Type | Name | Value |
|------|------|-------|
| CNAME | bounce | bounce.resend.dev (example) |
| CNAME | default._domainkey | default._domainkey.resend.dev (example) |
| MX | @ | mx1.resend.dev (example) |
| TXT | @ | v=spf1 include:resend.com ~all |

**Action Items:**

1. Copy DNS records from Resend dashboard
2. Log into your domain registrar (GoDaddy, Namecheap, etc.)
3. Add DNS records exactly as shown
4. **Wait 15-30 minutes** for DNS propagation
5. Return to Resend dashboard
6. Click **"Verify Domain"**

**Expected result:**
```
✓ Domain verified
✓ DKIM configured
✓ SPF configured
✓ DMARC ready
```

### 6.4 Update Backend Environment Variables

1. Go to Railway dashboard → backend service → **Variables**
2. Add or update:

```
RESEND_API_KEY = re_...
RESEND_FROM_EMAIL = noreply@sweetgrace.com
ADMIN_EMAIL = admin@sweetgrace.com
```

3. Railway auto-redeploys

### 6.5 Test Email Sending

**Method 1: Use Resend Test API**

```bash
# Using test key (resend_test_...) in development
curl -X POST "https://api.resend.com/emails" \
  -H "Authorization: Bearer re_..." \
  -H "Content-Type: application/json" \
  -d '{
    "from": "noreply@sweetgrace.com",
    "to": "admin@sweetgrace.com",
    "subject": "Test Email",
    "html": "<p>This is a test email from Sweet Grace</p>"
  }'

# Expected response:
# { "id": "... ", "from": "noreply@sweetgrace.com", "created_at": "2026-09-07T..." }
```

**Method 2: Test via Backend API**

```bash
# Trigger test email through your backend
curl -X POST https://api.sweetgrace.com/email/test \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@example.com"}'
```

### 6.6 Set Up Email Templates

Create email templates in Resend dashboard for:
- Order confirmation
- Order shipped
- Order delivered
- Contact form reply

1. In Resend dashboard, go to **Templates** (if available)
2. Create new template for each email type
3. Use dynamic variables: `{customerName}`, `{orderNumber}`, etc.
4. Test rendering

### 6.7 Troubleshooting

**Problem:** "Domain verification stuck"
```
Solution:
1. Verify DNS records are added correctly:
   nslookup -type=CNAME bounce.sweetgrace.com

2. Wait full 30 minutes for DNS propagation
   Use online tool: whatsmydns.net

3. Check record format exactly matches Resend dashboard:
   - No extra spaces
   - CNAME points to correct address

4. If using Cloudflare DNS:
   - Set proxy to "DNS only" (gray cloud icon)
   - Not "Proxied" (orange cloud)
```

**Problem:** "Emails going to spam"
```
Solution:
1. Ensure domain is fully verified (SPF/DKIM/DMARC green)
2. Verify DMARC record is added (may be optional)
3. Use clear subject lines (avoid spam triggers)
4. Include unsubscribe link (if list email)
5. Test with Gmail to see why it's spam:
   - Gmail marks as spam → click "Report spam" → Review
   - May take 24 hours for whitelist
```

**Problem:** "API key returns 'Unauthorized'"
```
Solution:
1. Verify key format: should start with re_
2. Check key is not truncated in env var
3. Ensure key has proper permissions
4. Generate new key from Resend dashboard if needed
5. Use correct key (not test key in production)
```

---

## 7. Storage Setup (Cloudflare R2)

**Time Estimate:** 20 minutes  
**Cost:** $15/month includes 10GB storage

### 7.1 Create R2 Bucket

1. Log into Cloudflare dashboard ([cloudflare.com](https://cloudflare.com))
2. Go to **R2** → **Buckets**
3. Click **"Create Bucket"**
4. Name: `sweet-grace-prod`
5. Region: **Geographically closest to your users**
6. Click **"Create Bucket"**

### 7.2 Get R2 Credentials

1. In Cloudflare, go to **R2 Settings** → **API Tokens**
2. Create new token:
   - Click **"Create API Token"**
   - Name: `sweet-grace-backend`
   - Permissions:
     - Object Read & Write
     - Bucket Read
   - TTL: No expiration (or set to 1 year)
3. After creation, you'll see:

```
Account ID: <32-character-hex>
Access Key ID: <20-character-code>
Secret Access Key: <40-character-secret>
```

**Save these securely - you won't see them again!**

### 7.3 Construct R2 Endpoint URL

Your endpoint URL format:
```
https://<account-id>.r2.cloudflarestorage.com
```

Example:
```
https://abcdef1234567890abcdef1234567890.r2.cloudflarestorage.com
```

### 7.4 Configure CORS (Optional but Recommended)

If frontend directly uploads to R2:

1. In Cloudflare, open your bucket
2. Go to **Settings** → **CORS**
3. Add configuration:

```json
[
  {
    "allowedOrigins": ["https://sweetgrace.com", "https://*.vercel.app"],
    "allowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "allowedHeaders": ["*"],
    "maxAgeSeconds": 86400
  }
]
```

### 7.5 Update Backend Environment Variables

1. Go to Railway dashboard → backend → **Variables**
2. Add or update:

```
AWS_REGION = auto
AWS_ACCESS_KEY_ID = <from step 7.2>
AWS_SECRET_ACCESS_KEY = <from step 7.2>
AWS_S3_BUCKET = sweet-grace-prod
AWS_S3_ENDPOINT = https://<account-id>.r2.cloudflarestorage.com
```

3. Railway auto-redeploys

### 7.6 Test File Upload

**Using AWS CLI (if installed):**

```bash
# Configure AWS CLI with R2 credentials
aws configure --profile r2
# AWS Access Key ID: <from step 7.2>
# AWS Secret Access Key: <from step 7.2>
# Default region: auto
# Default output format: json

# Test upload
aws s3 cp test.txt s3://sweet-grace-prod/test.txt --profile r2 --endpoint-url https://<account-id>.r2.cloudflarestorage.com

# Expected output:
# upload: ./test.txt to s3://sweet-grace-prod/test.txt
```

**Using your backend API:**

```bash
# POST file to upload endpoint (after backend is deployed)
curl -X POST https://api.sweetgrace.com/files/upload \
  -F "file=@./test-image.jpg"

# Expected response:
# {
#   "url": "https://sweet-grace-prod.r2.cloudflarestorage.com/uploads/...",
#   "size": 12345,
#   "mime": "image/jpeg"
# }
```

### 7.7 Troubleshooting

**Problem:** "Access Denied" when uploading
```
Solution:
1. Verify credentials are correct:
   - AWS_ACCESS_KEY_ID format: 20 characters
   - AWS_SECRET_ACCESS_KEY format: 40 characters

2. Check bucket name matches:
   AWS_S3_BUCKET should be: sweet-grace-prod

3. Verify endpoint URL:
   Should be: https://XXXX.r2.cloudflarestorage.com
   (not cloudstorage.com)

4. Ensure API token has permissions:
   - Object Read & Write
   - Bucket Read

5. Create new token and retry if still failing
```

**Problem:** "Bucket not found"
```
Solution:
1. Verify bucket name in Cloudflare dashboard
2. Double-check spelling (case-sensitive for AWS/S3)
3. Ensure bucket was successfully created
4. Try listing buckets:
   aws s3 ls --profile r2 --endpoint-url https://XXXX.r2.cloudflarestorage.com
```

**Problem:** "File upload slow or timing out"
```
Solution:
1. Check file size (R2 has size limits)
2. For large files, use multipart upload
3. May be network issue - retry
4. Check Cloudflare dashboard for service status
```

---

## 8. DNS Configuration

**Time Estimate:** 30 minutes  
**Note:** DNS changes can take 24-48 hours to fully propagate

### 8.1 Add Domain to Vercel

1. In Vercel dashboard, open your frontend project
2. Go to **Settings** → **Domains**
3. Click **"Add Domain"**
4. Enter: `sweetgrace.com`
5. Vercel will show DNS setup instructions

**Vercel provides:**
- Nameservers to add to your domain registrar, OR
- CNAME records if you keep your current DNS provider

### 8.2 Add Domain to Railway (for Backend API)

1. In Railway dashboard, open backend service
2. Look for **Domain** or **Custom Domain** section
3. Click **"Add Domain"**
4. Enter: `api.sweetgrace.com`
5. Choose how to configure:
   - **Option A:** Use Railway nameservers
   - **Option B:** Add CNAME record to your DNS

### 8.3 Configure DNS Records

**Choose your DNS provider:**

**Option A: Use Cloudflare (Recommended)**

1. Go to [cloudflare.com](https://cloudflare.com)
2. Add site: click **"Add a Site"**
3. Enter: `sweetgrace.com`
4. Choose free plan
5. Cloudflare provides new nameservers

**Update nameservers at your domain registrar:**

1. Go to domain registrar (GoDaddy, Namecheap, etc.)
2. Find **Nameserver Settings** or **DNS Settings**
3. Replace default nameservers with Cloudflare's:
   ```
   ns1.cloudflare.com
   ns2.cloudflare.com
   ```
4. Save changes (may take 24-48 hours to propagate)

**Option B: Keep your current DNS provider**

If you don't want to switch DNS providers:

1. In Vercel, click **"Set Nameservers"** → **"CNAME"**
2. Copy the CNAME values Vercel provides
3. Log into your current DNS provider
4. Add these CNAME records:

```
CNAME  sweetgrace.com     → cname.vercel-dns.com
CNAME  www.sweetgrace.com → cname.vercel-dns.com
CNAME  api.sweetgrace.com → cname.railway.app (or your Railway domain)
```

### 8.4 Add DNS Records (Cloudflare)

Once Cloudflare is managing your domain:

1. In Cloudflare dashboard, go to **DNS** → **Records**
2. Add records:

**For Frontend (from Vercel):**
```
Type: CNAME
Name: sweetgrace.com (or @)
Target: cname.vercel-dns.com
Proxy: DNS only (gray cloud)
TTL: Auto
```

**For API Backend (from Railway):**
```
Type: CNAME
Name: api
Target: cname.railway.app
Proxy: DNS only (gray cloud)
TTL: Auto
```

**Optional - For www subdomain:**
```
Type: CNAME
Name: www
Target: sweetgrace.com
Proxy: DNS only (gray cloud)
TTL: Auto
```

### 8.5 SSL/TLS Configuration

1. In Cloudflare dashboard, go to **SSL/TLS**
2. Set **Encryption Mode** to **"Full (strict)"**
3. Automatic certificate management is enabled by default
4. Both Vercel and Railway provide automatic SSL

### 8.6 Verify DNS Propagation

```bash
# Check CNAME records
nslookup sweetgrace.com
nslookup api.sweetgrace.com

# Should return:
# Non-authoritative answer:
# sweetgrace.com canonical name = cname.vercel-dns.com
# api.sweetgrace.com canonical name = cname.railway.app

# Check DNS propagation globally (may take 24-48 hours):
# Visit: https://whatsmydns.net/
# Enter: sweetgrace.com
# Wait for all servers to show new IP
```

### 8.7 Test Domain Resolution

```bash
# After DNS propagates (may take up to 48 hours):

# Test frontend
curl -I https://sweetgrace.com

# Expected: HTTP/1.1 200 OK
# Should show Vercel server headers

# Test API
curl -I https://api.sweetgrace.com/health

# Expected: HTTP/1.1 200 OK
```

### 8.8 Troubleshooting

**Problem:** "Domain not yet available / 404 error"
```
Solution:
1. DNS changes take 24-48 hours to propagate
2. Check propagation with: whatsmydns.net
3. Force refresh your local DNS:
   - macOS: sudo dscacheutil -flushcache
   - Windows: ipconfig /flushdns
   - Linux: sudo systemctl restart systemd-resolved

4. Verify DNS records are correct:
   nslookup sweetgrace.com (should show CNAME target)

5. Wait longer and try again (DNS cache)
```

**Problem:** "SSL certificate error on domain"
```
Solution:
1. SSL certificate generation takes 5-10 minutes after DNS is live
2. Wait 10 minutes, then try:
   curl https://sweetgrace.com 2>&1 | grep "certificate"

3. In Vercel dashboard, check certificate status
4. In Railway dashboard, check certificate status
5. Check Cloudflare SSL/TLS settings are set to "Full"
```

**Problem:** "CNAME records not showing"
```
Solution:
1. Verify DNS records were added correctly in Cloudflare
2. Wait 5 minutes after adding records
3. Check with: dig sweetgrace.com CNAME (on Mac/Linux)
4. If still not showing, verify:
   - Record name (sweetgrace.com vs @)
   - Proxy setting is "DNS only" not "Proxied"
   - No conflicting A records exist
```

---

## 9. Post-Deployment Testing

**Time Estimate:** 45 minutes

### 9.1 Verify All Components are Running

**Check Frontend:**
```bash
curl -I https://sweetgrace.com

# Expected: HTTP/1.1 200 OK
# Headers should include: Server: Vercel
# x-vercel-id: xxxxxx
```

**Check API Health:**
```bash
curl https://api.sweetgrace.com/health

# Expected response:
# {"status":"ok","timestamp":"2026-09-07T...","uptime":123.45}
```

**Check Database Connection:**
```bash
# Backend logs should show successful DB connection
# In Railway dashboard → backend service → Logs
# Look for: "Database connected successfully" or similar
```

### 9.2 Test Complete Checkout Flow

**Step 1: View Products**
```bash
curl https://api.sweetgrace.com/products/categories

# Expected: 200 OK
# Should return category list: [ { "id": "...", "name": "..." } ]
```

**Step 2: Create Order**
```bash
curl -X POST https://api.sweetgrace.com/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test Customer",
    "customerEmail": "test@example.com",
    "customerPhone": "+1234567890",
    "items": [
      { "productId": "xxx", "quantity": 1, "price": 2500 }
    ],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "zip": "94102",
      "country": "US"
    }
  }'

# Expected: 201 Created
# Response should include: { "id": "order_xxx", "status": "pending" }
```

**Step 3: Create Payment Intent**
```bash
curl -X POST https://api.sweetgrace.com/payments/intent \
  -H "Content-Type: application/json" \
  -d '{ "orderId": "order_xxx", "amount": 2500 }'

# Expected: 200 OK
# Response: { "clientSecret": "pi_xxx_secret_yyy", "amount": 2500 }
```

**Step 4: Complete Checkout in Browser**

1. Open https://sweetgrace.com
2. Add product to cart
3. Proceed to checkout
4. Enter test payment info:
   - Card: `4242 4242 4242 4242`
   - Expiration: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
5. Submit
6. Should see success page

### 9.3 Test Email Notifications

**Verify email was sent:**

1. Check admin email inbox (admin@sweetgrace.com)
2. Look for order confirmation email
3. Verify:
   - Subject line is clear
   - Order details displayed correctly
   - Links work
   - Not in spam folder

**Check Resend logs:**

1. Go to Resend dashboard → **Logs**
2. Look for recent sent email
3. Check status: `Sent`, `Opened`, `Bounced`, or `Failed`

### 9.4 Test Stripe Integration

**Verify payment was recorded:**

1. Go to Stripe dashboard
2. Navigate to **Payments** or **Transactions**
3. Look for recent payment with amount matching test
4. Check status: **Succeeded**

**Verify webhook was received:**

1. In Stripe dashboard → **Developers** → **Webhooks**
2. Click your endpoint: `https://api.sweetgrace.com/payments/webhook`
3. Scroll to **Events**
4. Should see `payment_intent.succeeded` event
5. Click event to see details

### 9.5 Test File Upload (If Applicable)

```bash
# Upload a test image
curl -X POST https://api.sweetgrace.com/files/upload \
  -F "file=@./test-image.jpg"

# Expected: 200 OK
# Response: {
#   "url": "https://sweet-grace-prod.r2.cloudflarestorage.com/...",
#   "size": 12345,
#   "mime": "image/jpeg"
# }

# Verify file is accessible
curl -I "https://sweet-grace-prod.r2.cloudflarestorage.com/..."

# Expected: HTTP/1.1 200 OK
# Should download or display the image
```

### 9.6 Performance Testing

**Check frontend performance:**

1. Open https://sweetgrace.com
2. Open browser DevTools (F12)
3. Go to **Performance** or **Network** tab
4. Reload page and check:
   - Page Load Time: < 3 seconds
   - Largest Contentful Paint (LCP): < 2.5s
   - Cumulative Layout Shift (CLS): < 0.1
   - First Input Delay (FID): < 100ms

**Check backend API latency:**

```bash
# Install Apache Bench if not present
# macOS: brew install httpd
# Linux: sudo apt-get install apache2-utils

# Test API response time
ab -n 10 -c 1 https://api.sweetgrace.com/health

# Expected output:
# Requests per second: >100 (more is better)
# Time per request: <100ms
# Failed requests: 0
```

### 9.7 Check Logs for Errors

**Railway Backend Logs:**

1. Go to Railway dashboard → backend service
2. Click **Logs** tab
3. Watch for last 30 minutes of logs
4. Look for `[ERROR]` entries
5. Common errors to watch for:
   - Database connection failures
   - Payment processing errors
   - File upload failures
   - Email sending errors

**Vercel Frontend Logs:**

1. Go to Vercel dashboard → project → **Deployments**
2. Click latest deployment
3. Check **Build Logs** - should be all green checks
4. Check **Runtime Logs** - look for errors

**Stripe Logs:**

1. Go to Stripe dashboard → **Developers** → **Logs**
2. Look for recent API calls
3. All should show `status: 200` or `status: 201`

### 9.8 Test Error Handling

**Test 404 Endpoint:**
```bash
curl https://api.sweetgrace.com/products/nonexistent

# Expected: 404 Not Found
```

**Test Invalid Payment:**
```bash
curl -X POST https://api.sweetgrace.com/payments/intent \
  -H "Content-Type: application/json" \
  -d '{ "orderId": "invalid_order", "amount": -100 }'

# Expected: 400 Bad Request
# Should include error message
```

**Test Database Failure (if applicable):**

1. Temporarily disconnect backend from database (for testing)
2. Try to access `/products`
3. Should return 503 Service Unavailable with meaningful error
4. Reconnect database

### 9.9 Troubleshooting Post-Deploy Issues

**Problem:** "Frontend loads but shows 'Cannot reach API'"
```
Solution:
1. Verify backend is running: curl https://api.sweetgrace.com/health
2. Check NEXT_PUBLIC_API_URL in Vercel is correct
3. Verify CORS headers in backend
4. Check backend logs for errors
5. Redeploy frontend if env var just changed
```

**Problem:** "Products page shows empty"
```
Solution:
1. Check database has product data
2. Verify DATABASE_URL in Railway is correct
3. Confirm migrations ran: npx prisma migrate deploy
4. Check backend logs for query errors
5. Verify API endpoint: GET /products/categories returns data
```

**Problem:** "Checkout page doesn't load Stripe elements"
```
Solution:
1. Verify NEXT_PUBLIC_STRIPE_KEY is set in Vercel
2. Check key starts with pk_live_ (not pk_test_)
3. Verify frontend redeploy happened
4. Check browser console for JavaScript errors
5. Test in different browser
```

---

## 10. Monitoring & Alerts

**Time Estimate:** 20 minutes (initial setup)

### 10.1 Set Up Monitoring in Railway

1. Go to Railway dashboard → backend service
2. Go to **Metrics** tab
3. View default metrics:
   - CPU usage
   - Memory usage
   - Network I/O
   - Request count
   - Response time

**Expected healthy values:**
- CPU: < 50%
- Memory: < 200MB
- Response time: < 500ms p95
- Error rate: < 1%

### 10.2 Set Up Monitoring in Vercel

1. Go to Vercel dashboard → project
2. Go to **Analytics** tab
3. View metrics:
   - Core Web Vitals
   - Real user metrics
   - Cumulative Layout Shift
   - First Input Delay

### 10.3 Monitor Stripe Payments

1. Go to Stripe dashboard → **Payments**
2. Set up views for:
   - Recent transactions
   - Failed payments
   - Refunds
   - Disputes

**Set up alerts (if available in your plan):**
- Alert if failure rate > 5%
- Alert if average transaction time > 5 seconds

### 10.4 Monitor Email Delivery

1. Go to Resend dashboard → **Logs**
2. Filter by status:
   - **Sent**: Delivered successfully
   - **Bounced**: Hard bounce (invalid address)
   - **Failed**: Soft bounce (temporary issue)

**Target metrics:**
- Delivery rate > 98%
- Bounce rate < 2%

### 10.5 Monitor Database

In Neon dashboard:

1. Go to **Monitoring** (if available)
2. View metrics:
   - Active connections
   - Query performance
   - Storage used
   - Backup status

**Expected behavior:**
- Storage growing slowly (watch for large logs)
- Connections staying stable
- Queries executing in < 100ms

### 10.6 Set Up Error Tracking (Optional but Recommended)

**Using Sentry (Free tier available):**

1. Go to [sentry.io](https://sentry.io)
2. Sign up
3. Create new project: Select **Node** for backend
4. Get `SENTRY_DSN`: looks like `https://xxx@sentry.io/xxx`
5. Add to Railway env vars:
   ```
   SENTRY_DSN = https://xxx@sentry.io/xxx
   ```
6. Instrument code (backend should have Sentry integration)
7. Errors will now be captured and reported

### 10.7 Create Monitoring Dashboard

Consider creating a simple checklist to review daily:

```
Daily Health Check:
- [ ] Backend health check responding (https://api.sweetgrace.com/health)
- [ ] Frontend loads (https://sweetgrace.com)
- [ ] Check Railway CPU < 50%
- [ ] Check Railway memory < 200MB
- [ ] Check Stripe error rate < 1%
- [ ] Check Resend bounce rate < 2%
- [ ] Check Neon connections stable
- [ ] Review error logs for anomalies
```

### 10.8 Set Up Notifications

**Via Email:**

Most platforms allow email alerts:
- Railway: Service health changes
- Vercel: Deployment failures
- Stripe: Failed charges

**Via Slack (if integrated):**

1. Connect your team Slack workspace
2. Route alerts to `#deployments` channel
3. Get notified of:
   - Failed deployments
   - High error rates
   - Service outages

### 10.9 Performance Baselines

After initial deployment, establish baselines:

```
Baseline Metrics (Week 1):
- API response time p95: [measure]
- Frontend page load: [measure]
- Database query time p95: [measure]
- Memory usage stable: [yes/no]
- Error rate normal: [measure]%
```

Monitor these going forward and alert if they degrade by 20%.

---

## Final Checklist

Before declaring deployment complete:

- [ ] **Code**
  - [ ] All tests passing
  - [ ] No linting errors
  - [ ] Builds without warnings

- [ ] **Backend**
  - [ ] Database migrations run
  - [ ] Environment variables all set
  - [ ] Health check responding
  - [ ] Logs show no errors
  - [ ] API accessible from internet

- [ ] **Frontend**
  - [ ] Deployment successful
  - [ ] Pages load without errors
  - [ ] Stripe integration works
  - [ ] API communication working

- [ ] **Payment Processing**
  - [ ] Stripe keys configured
  - [ ] Test payment succeeds
  - [ ] Webhook receives events
  - [ ] Order created after payment

- [ ] **Email**
  - [ ] Domain verified in Resend
  - [ ] Test email sends
  - [ ] SPF/DKIM records configured
  - [ ] Order confirmation email sends

- [ ] **Storage**
  - [ ] R2 bucket created
  - [ ] Credentials configured
  - [ ] Test file upload works
  - [ ] CORS configured

- [ ] **DNS**
  - [ ] Domain points to frontend
  - [ ] API subdomain points to backend
  - [ ] SSL certificates active
  - [ ] Propagation verified

- [ ] **Monitoring**
  - [ ] Metrics visible in dashboards
  - [ ] Logs accessible
  - [ ] Alerts configured
  - [ ] Error tracking enabled

---

## Quick Reference: Troubleshooting By Component

| Component | Issue | First Check | Second Check |
|-----------|-------|------------|--------------|
| Backend API | Won't start | Railway logs | DATABASE_URL format |
| Backend API | Can't reach | Firewall | Health check passing |
| Database | Connection refused | Neon status | Connection string SSL |
| Frontend | Blank page | Build logs | API reachable? |
| Stripe | Payments fail | Secret key set? | Webhook endpoint live? |
| Email | Not sending | API key valid? | Domain verified? |
| R2 Storage | Upload fails | Credentials correct? | Bucket exists? |
| DNS | Domain 404 | Propagated? | CNAME records added? |

---

## Important Reminders

1. **Never commit secrets** - Use env vars only
2. **Database backups** - Neon auto-backups; verify enabled
3. **Scalability** - Monitor usage as traffic grows
4. **Cost monitoring** - Set billing alerts on each service
5. **Security** - Use strong JWT secret, rotate credentials regularly
6. **Logs retention** - Check log retention policies on each platform

---

## Support & Resources

- **Railway Docs:** https://docs.railway.app
- **Vercel Docs:** https://vercel.com/docs
- **Stripe Docs:** https://stripe.com/docs
- **Neon Docs:** https://neon.tech/docs
- **Resend Docs:** https://resend.com/docs
- **Cloudflare R2 Docs:** https://developers.cloudflare.com/r2

---

**Deployment Complete!** 🎉

Your Sweet Grace e-commerce platform is now live in production. Monitor the dashboards, watch the logs, and iterate based on real user feedback.

