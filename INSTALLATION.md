# Installation Guide

This guide provides detailed instructions for installing and setting up the Barcode Tracking System, including troubleshooting common issues.

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** 10+
- **PostgreSQL** 15+ (or Supabase account)
- **Git**

For mobile development:
- **Android Studio** (for Android builds)
- **Xcode** (for iOS builds, macOS only)

## Quick Installation

### Automated Setup (Recommended)

```bash
# Run the automated setup script
./dev-setup.sh
```

This script will:
- Check Node.js version
- Create environment files
- Install all dependencies
- Setup database
- Seed sample data

### Manual Installation

If you prefer to install manually or the automated script fails:

#### 1. Install Backend (API)

```bash
cd api

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration:
# - DATABASE_URL=postgresql://user:password@localhost:5432/barcode_tracker
# - JWT_SECRET=your-secure-secret-key
# - ALLOWED_ORIGINS=http://localhost:5173

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:push

# Seed database with sample products
npm run db:seed

# Start development server
npm run dev
```

API should now be running at `http://localhost:3000`

#### 2. Install Mobile App

```bash
cd app

# Install dependencies with legacy peer deps flag
npm install --legacy-peer-deps

# Create environment file
cp .env.example .env

# Edit .env with your configuration:
# - VITE_API_URL=http://localhost:3000/api/v1
# - VITE_SUPABASE_URL=https://your-project.supabase.co (optional)
# - VITE_SUPABASE_ANON_KEY=your-anon-key (optional)
# - VITE_SENTRY_DSN=your-sentry-dsn (optional)

# Start development server
npm run dev
```

App should now be running at `http://localhost:5173`

## Common Issues & Solutions

### Issue 1: ZXing Peer Dependency Conflict

**Error:**
```
npm error peer @zxing/library@"^0.21.0" from @zxing/browser@0.1.5
npm error Found: @zxing/library@0.20.0
```

**Solution:**
This has been fixed in the latest package.json. The project now uses:
- `@zxing/library@^0.21.3` (updated from 0.20.0)

If you still encounter this, update your package.json:
```json
{
  "@zxing/library": "^0.21.3"
}
```

### Issue 2: Sentry Version Conflicts

**Error:**
```
This version of Sentry Capacitor is incompatible with @sentry/vue
Please install @sentry/vue@7.114.0 --update-sentry-capacitor
```

**Solution:**
The project uses exact Sentry versions to avoid conflicts:
- `@sentry/capacitor@0.18.0` (exact version, not ^0.18.0)
- `@sentry/vue@7.114.0` (exact version, not ^7.114.0)

**Important:** Always install with `--legacy-peer-deps` flag:
```bash
npm install --legacy-peer-deps
```

### Issue 3: Sharp Binary Download Failure

**Error:**
```
sharp: Installation error: Status 403 Forbidden
```

**Solution:**
The `@capacitor/assets` package (which depends on sharp) has been removed from devDependencies as it's only needed for generating app icons/splash screens, not for development.

If you need to generate assets, install it separately:
```bash
npm install --save-dev @capacitor/assets
```

### Issue 4: Node Version Compatibility

**Warning:**
```
npm warn EBADENGINE Unsupported engine {
  package: 'fast-jwt@3.3.3',
  required: { node: '>=16 <22' },
  current: { node: 'v22.21.0' }
}
```

**Solution:**
This is just a warning and can be safely ignored. The package works fine with Node 22.x.

If you prefer to avoid the warning, you can use Node 20 LTS:
```bash
nvm install 20
nvm use 20
```

### Issue 5: Database Connection Errors

**Error:**
```
Error: Can't reach database server at localhost:5432
```

**Solutions:**

1. **PostgreSQL not running:**
   ```bash
   # macOS
   brew services start postgresql@15
   
   # Linux
   sudo systemctl start postgresql
   
   # Windows
   # Use Services app to start PostgreSQL
   ```

2. **Wrong connection string:**
   Check your `.env` file:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/dbname
   ```

3. **Use Supabase instead:**
   - Create free account at [supabase.com](https://supabase.com)
   - Get connection string from project settings
   - Update DATABASE_URL in .env

### Issue 6: Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**

1. **Change the port:**
   ```bash
   # In api/.env
   PORT=3001
   
   # Update app/.env
   VITE_API_URL=http://localhost:3001/api/v1
   ```

2. **Kill existing process:**
   ```bash
   # macOS/Linux
   lsof -ti:3000 | xargs kill -9
   
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

## Verification

### Test API is Running

```bash
curl http://localhost:3000/api/v1/health

# Expected response:
# {"ok":true,"timestamp":"2025-11-05T..."}
```

### Test App is Running

1. Open browser to `http://localhost:5173`
2. You should see the login screen
3. Click "Start Scan" to test camera access

### Run Tests

```bash
# API tests (if available)
cd api
npm test

# App tests
cd app
npm test

# App tests with coverage
npm run test:coverage
```

## Development Tools

### Database Management

```bash
# Open Prisma Studio (GUI for database)
cd api
npm run db:studio

# View tables, edit data, run queries
# Opens at http://localhost:5555
```

### Check Database Schema

```bash
cd api

# View current schema
cat prisma/schema.prisma

# Generate Prisma client after schema changes
npm run db:generate

# Apply schema changes to database
npm run db:push

# Create migration (production)
npm run db:migrate
```

### Debugging

#### Enable Debug Logging (API)

```bash
# In api/.env
LOG_LEVEL=debug
```

#### Enable Debug Logging (App)

```javascript
// In app/src/main.ts
import { logger } from '@/shared/utils/logger'
logger.setLevel('debug')
```

#### Use Browser DevTools

- Open Chrome DevTools (F12)
- Check Console for errors
- Check Network tab for API calls
- Use Vue DevTools extension

## Environment Variables Reference

### API (.env)

```env
# Server
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/barcode_tracker

# JWT
JWT_SECRET=your-very-long-random-secret-at-least-32-characters

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:8100

# Supabase (Optional)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_JWT_SECRET=your-supabase-jwt-secret

# Sentry (Optional)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# API Version
API_VERSION=1.0.0
```

### App (.env)

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api/v1

# Supabase (Optional - for authentication)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Sentry (Optional - for error tracking)
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
VITE_SENTRY_ENVIRONMENT=development

# App Version
VITE_APP_VERSION=0.1.0
```

## Next Steps

After successful installation:

1. **Read Documentation:**
   - [DEVELOPMENT.md](./docs/DEVELOPMENT.md) - Development workflows
   - [API.md](./docs/API.md) - API reference
   - [MOBILE_BUILD.md](./docs/MOBILE_BUILD.md) - Building for iOS/Android

2. **Try the App:**
   - Test barcode scanning
   - Test offline mode (disable network)
   - Check sync functionality

3. **Customize:**
   - Add your company branding
   - Configure barcode formats
   - Setup authentication (Supabase)
   - Setup error tracking (Sentry)

4. **Deploy:**
   - See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for production deployment

## Getting Help

If you encounter issues not covered here:

1. **Check existing issues:** [GitHub Issues](https://github.com/your-username/BarcodeTracking/issues)
2. **Create new issue:** Include error logs, Node version, OS
3. **Check logs:**
   ```bash
   # API logs
   cd api && npm run dev
   
   # App logs
   cd app && npm run dev
   
   # Check npm debug logs
   cat ~/.npm/_logs/*-debug-*.log
   ```

## Clean Installation

If you want to start fresh:

```bash
# Remove all node_modules and lock files
rm -rf app/node_modules app/package-lock.json
rm -rf api/node_modules api/package-lock.json

# Clear npm cache
npm cache clean --force

# Reinstall
cd api && npm install
cd ../app && npm install --legacy-peer-deps
```

## Production Installation

For production deployment, see:
- [DEPLOYMENT.md](./docs/DEPLOYMENT.md) - Backend deployment
- [MOBILE_BUILD.md](./docs/MOBILE_BUILD.md) - Mobile app builds

Key differences:
- Use production database (not localhost)
- Set NODE_ENV=production
- Use environment-specific secrets
- Enable SSL/TLS
- Setup monitoring (Sentry)
- Configure rate limiting
- Setup backups

---

**Last Updated:** November 5, 2025

For more information, see [README.md](./README.md)
