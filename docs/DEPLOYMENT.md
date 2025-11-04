# Deployment Guide

Complete guide for deploying the Barcode Tracking System to production.

---

## Overview

This system consists of two main components:
1. **Backend API** - Node.js/Fastify server
2. **Mobile App** - Capacitor/Vue application

---

## Backend API Deployment

### Option 1: Render (Recommended)

**Pros:** Free tier, automatic deploys, managed PostgreSQL
**Cons:** Slower cold starts on free tier

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create PostgreSQL Database**
   - New > PostgreSQL
   - Name: `barcode-tracker-db`
   - Region: Choose closest to users
   - Copy Internal Database URL

3. **Create Web Service**
   - New > Web Service
   - Connect your GitHub repo
   - Settings:
     - **Root Directory**: `api`
     - **Build Command**: `npm install && npm run db:generate && npm run build`
     - **Start Command**: `npm start`
     - **Environment**: Node

4. **Configure Environment Variables**
   ```
   NODE_ENV=production
   DATABASE_URL=[your-postgres-internal-url]
   JWT_SECRET=[generate-random-32-char-string]
   ALLOWED_ORIGINS=https://yourapp.com
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_JWT_SECRET=[your-supabase-jwt-secret]
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (~5 min)
   - Note your API URL: `https://your-app.onrender.com`

6. **Run Migrations**
   - Go to Shell tab
   - Run: `npm run db:push && npm run db:seed`

---

### Option 2: Railway

**Pros:** Generous free tier, fast deploys
**Cons:** Requires credit card

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **New Project**
   - New Project > Deploy from GitHub repo
   - Select your repo

3. **Add PostgreSQL**
   - Add > Database > PostgreSQL
   - Copy DATABASE_URL

4. **Configure API Service**
   - Settings > Environment Variables:
     ```
     NODE_ENV=production
     DATABASE_URL=${{Postgres.DATABASE_URL}}
     JWT_SECRET=[random-string]
     ALLOWED_ORIGINS=https://yourapp.com
     ```

5. **Configure Build**
   - Settings:
     - **Root Directory**: `/api`
     - **Build Command**: `npm install && npm run db:generate && npm run build`
     - **Start Command**: `npm start`

6. **Deploy**
   - Push to main branch triggers deploy
   - Get public domain from Settings

---

### Option 3: DigitalOcean App Platform

1. **Create App**
   - Apps > Create App
   - Connect GitHub repo

2. **Add Database**
   - Add Resource > Database > PostgreSQL
   - Choose plan ($7/month minimum)

3. **Configure Service**
   - Type: Web Service
   - Source Directory: `/api`
   - Build Command: `npm install && npm run db:generate && npm run build`
   - Run Command: `npm start`

4. **Environment Variables**
   ```
   DATABASE_URL=${db.DATABASE_URL}
   NODE_ENV=production
   JWT_SECRET=[your-secret]
   ALLOWED_ORIGINS=https://yourapp.com
   ```

5. **Deploy**
   - Review and create
   - Assign domain

---

### Option 4: AWS (Advanced)

<details>
<summary>Expand AWS deployment instructions</summary>

**Components:**
- ECS Fargate for API
- RDS PostgreSQL for database
- Application Load Balancer
- CloudWatch for logs

**Prerequisites:**
- AWS Account
- AWS CLI configured
- Docker installed

**Steps:**

1. **Build Docker Image**
   ```bash
   cd api
   docker build -t barcode-tracker-api .
   ```

2. **Push to ECR**
   ```bash
   aws ecr create-repository --repository-name barcode-tracker-api
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin [account-id].dkr.ecr.us-east-1.amazonaws.com
   docker tag barcode-tracker-api:latest [account-id].dkr.ecr.us-east-1.amazonaws.com/barcode-tracker-api:latest
   docker push [account-id].dkr.ecr.us-east-1.amazonaws.com/barcode-tracker-api:latest
   ```

3. **Create RDS PostgreSQL**
   ```bash
   aws rds create-db-instance \
     --db-instance-identifier barcode-tracker-db \
     --db-instance-class db.t3.micro \
     --engine postgres \
     --master-username admin \
     --master-user-password [your-password] \
     --allocated-storage 20
   ```

4. **Create ECS Cluster**
   - Use AWS Console or Terraform
   - Configure task definition with environment variables
   - Setup service with load balancer

</details>

---

## Database Setup

### PostgreSQL (Required)

**Render/Railway:** Automatically provisioned

**Local/Custom:**
```bash
# Create database
createdb barcode_tracker

# Run migrations
cd api
npm run db:push

# Seed data
npm run db:seed
```

### Supabase (Optional - for Auth)

1. **Create Project**
   - Go to [supabase.com](https://supabase.com)
   - New Project

2. **Get Credentials**
   - Settings > API
   - Copy:
     - Project URL
     - Anon Public Key
     - JWT Secret

3. **Configure**
   - Add to API env vars
   - Add to mobile app env vars

---

## Mobile App Deployment

### Web Version (PWA)

1. **Build**
   ```bash
   cd app
   npm run build
   ```

2. **Deploy to Netlify**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=dist
   ```

3. **Or Vercel**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

4. **Configure Environment**
   - Add production env vars to platform
   - `VITE_API_URL=https://your-api.onrender.com/api/v1`

### Android App

See [MOBILE_BUILD.md](./MOBILE_BUILD.md) for complete guide.

**Quick Steps:**
```bash
cd app
npm run build
npx cap sync android
cd android
./gradlew bundleRelease
```

Upload to Google Play Console.

### iOS App

**Quick Steps:**
```bash
cd app
npm run build
npx cap sync ios
npx cap open ios
```

Archive and upload via Xcode.

---

## CI/CD Setup

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Render
        uses: johnbeynon/render-deploy-action@v0.0.8
        with:
          service-id: ${{ secrets.RENDER_SERVICE_ID }}
          api-key: ${{ secrets.RENDER_API_KEY }}

  deploy-app:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install and Build
        run: |
          cd app
          npm install
          npm run build

      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2
        with:
          publish-dir: './app/dist'
          production-branch: main
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

---

## Environment Variables

### API Production

```env
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Security
JWT_SECRET=your-very-long-random-secret-at-least-32-characters

# CORS
ALLOWED_ORIGINS=https://yourapp.com,https://www.yourapp.com

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

### App Production

```env
VITE_API_URL=https://api.yourapp.com/api/v1
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SENTRY_DSN=https://your-sentry-dsn
VITE_APP_VERSION=1.0.0
```

---

## Health Checks & Monitoring

### API Health Endpoint

```bash
curl https://your-api.com/api/v1/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-04T10:00:00.000Z",
  "uptime": 123.456,
  "environment": "production"
}
```

### Uptime Monitoring

**UptimeRobot (Free)**
1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Add new monitor
3. URL: `https://your-api.com/api/v1/health`
4. Interval: 5 minutes

**Better Uptime**
1. Go to [betteruptime.com](https://betteruptime.com)
2. Create monitor
3. Set alerts

### Error Tracking

**Sentry**
1. Create project at [sentry.io](https://sentry.io)
2. Get DSN
3. Add to environment:
   - `VITE_SENTRY_DSN` for app
4. Errors auto-reported

---

## Performance

### API Optimization

```bash
# Enable compression
npm install @fastify/compress

# Add to server.ts
import compress from '@fastify/compress'
await fastify.register(compress)
```

### Database Optimization

```sql
-- Add indexes (already in schema.prisma)
CREATE INDEX idx_scans_timestamp ON scans(timestamp DESC);
CREATE INDEX idx_scans_user ON scans(user_id);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM scans WHERE user_id = 'xyz' LIMIT 50;
```

### CDN (Optional)

Add CloudFlare for:
- SSL/TLS
- DDoS protection
- Caching static assets
- Global CDN

---

## Security Checklist

- [ ] Environment variables secured
- [ ] JWT secret is strong (32+ characters)
- [ ] CORS origins restricted
- [ ] HTTPS enabled
- [ ] Database credentials rotated
- [ ] API rate limiting enabled
- [ ] Supabase RLS policies configured
- [ ] Sentry error tracking active
- [ ] Backups configured (daily)
- [ ] Health checks monitored

---

## Backup & Recovery

### Database Backups

**Render:**
- Automatic daily backups (paid plan)
- Manual: Use `pg_dump`

**Manual Backup:**
```bash
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup-20251104.sql
```

**Automated Backups:**
```bash
# Add to crontab
0 2 * * * pg_dump $DATABASE_URL | gzip > /backups/db-$(date +\%Y\%m\%d).sql.gz
```

---

## Troubleshooting

### API won't start

1. Check logs: `heroku logs --tail` or Render dashboard
2. Verify DATABASE_URL is correct
3. Run migrations: `npm run db:push`
4. Check environment variables

### Database connection errors

1. Check connection string format
2. Verify database is running
3. Check firewall rules
4. Test connection: `psql $DATABASE_URL`

### Mobile app can't reach API

1. Verify API_URL in env
2. Check CORS settings
3. Ensure HTTPS (required for Capacitor)
4. Test in browser first

---

## Scaling

### Horizontal Scaling (Render/Railway)

- Increase instance count
- Add load balancer
- Use managed PostgreSQL with read replicas

### Vertical Scaling

- Upgrade instance size
- Increase database resources
- Add Redis for caching

### Database Scaling

1. Add read replicas
2. Enable connection pooling
3. Use Prisma Accelerate
4. Consider managed services (Supabase, PlanetScale)

---

## Cost Estimation

### Free Tier (Good for MVP)
- **Render Free**: API + PostgreSQL ($0)
- **Netlify Free**: Web app ($0)
- **Supabase Free**: Auth + DB ($0)
- **Total**: $0/month

### Small Scale
- **Render Starter**: API ($7) + DB ($7)
- **Netlify Pro**: $19/month
- **Supabase Pro**: $25/month
- **Total**: ~$60/month

### Production Scale
- **Render Pro**: API ($25) + DB ($25)
- **Netlify Pro**: $19/month
- **Supabase Pro**: $25/month
- **Sentry**: $26/month
- **Total**: ~$120/month

---

**Last Updated:** November 4, 2025
