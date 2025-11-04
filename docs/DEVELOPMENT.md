# Development Guide

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)
```bash
./dev-setup.sh
```

### Option 2: Manual Setup

#### 1. Install Dependencies
```bash
# Backend API
cd api
npm install

# Frontend App
cd ../app
npm install
```

#### 2. Configure Environment Variables
```bash
# API (.env)
cd api
cp .env.example .env
# Edit DATABASE_URL, JWT_SECRET

# App (.env)
cd ../app
cp .env.example .env
# Edit VITE_API_URL if needed
```

#### 3. Setup Database
```bash
cd api

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed
```

#### 4. Start Development Servers
```bash
# Terminal 1 - API
cd api
npm run dev

# Terminal 2 - App
cd app
npm run dev
```

---

## 📁 Project Structure

```
BarcodeTracking/
├── app/                    # Mobile app (Capacitor + Vue + Ionic)
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   │   ├── scanner/    # Barcode scanning
│   │   │   ├── auth/       # Authentication
│   │   │   └── sync/       # Offline sync
│   │   ├── shared/         # Shared code
│   │   │   ├── composables/
│   │   │   ├── services/
│   │   │   └── utils/
│   │   ├── App.vue
│   │   └── main.ts
│   └── package.json
│
├── api/                    # Backend API (Fastify + TypeScript)
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Custom middleware
│   │   ├── utils/          # Utilities
│   │   └── server.ts
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Seed data
│   └── package.json
│
├── shared/                 # Shared TypeScript types
│   └── types/
│
└── docs/                   # Documentation
```

---

## 🔧 Development Workflow

### Adding a New Feature

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Mobile Feature**
   ```bash
   cd app/src/modules
   mkdir your-feature
   cd your-feature

   # Create files
   touch YourFeatureView.vue
   touch your-feature.service.ts
   touch your-feature.store.ts
   ```

3. **API Endpoint**
   ```bash
   cd api/src/routes
   touch your-feature.routes.ts
   ```

4. **Update Router/Server**
   - Add route in `app/src/router/index.ts`
   - Register route in `api/src/server.ts`

5. **Test Locally**
   ```bash
   # Test API
   curl http://localhost:3000/api/v1/your-endpoint

   # Test App
   # Open http://localhost:5173 in browser
   ```

6. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   git push origin feature/your-feature-name
   ```

### Database Changes

1. **Update Schema**
   ```bash
   cd api
   # Edit prisma/schema.prisma
   ```

2. **Create Migration**
   ```bash
   npm run db:migrate
   ```

3. **Update Seed Data (Optional)**
   ```bash
   # Edit prisma/seed.ts
   npm run db:seed
   ```

### Testing on Mobile Device

1. **Build Web Assets**
   ```bash
   cd app
   npm run build
   ```

2. **Sync with Native Platforms**
   ```bash
   npx cap sync
   ```

3. **Open in IDE**
   ```bash
   # Android
   npm run android

   # iOS
   npm run ios
   ```

4. **Run on Device**
   - Use Android Studio/Xcode to run on physical device or emulator

---

## 🧪 Testing

### Unit Tests
```bash
# API
cd api
npm test

# App
cd app
npm test
```

### Integration Tests
```bash
cd api
npm run test:integration
```

### E2E Tests
```bash
cd app
npm run test:e2e
```

---

## 🐛 Debugging

### API Debugging

1. **View Logs**
   ```bash
   cd api
   npm run dev
   # Logs will show in terminal with pino-pretty formatting
   ```

2. **VS Code Debugger**
   ```json
   // .vscode/launch.json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "type": "node",
         "request": "launch",
         "name": "Debug API",
         "runtimeExecutable": "npm",
         "runtimeArgs": ["run", "dev"],
         "cwd": "${workspaceFolder}/api",
         "skipFiles": ["<node_internals>/**"]
       }
     ]
   }
   ```

3. **Database Queries**
   ```bash
   cd api
   npm run db:studio
   # Opens Prisma Studio at http://localhost:5555
   ```

### App Debugging

1. **Browser DevTools**
   - Open http://localhost:5173
   - F12 to open DevTools
   - Use Vue DevTools extension

2. **Mobile Debugging**
   ```bash
   # Android
   chrome://inspect

   # iOS
   Safari > Develop > [Your Device]
   ```

3. **Network Debugging**
   - Check Network tab in DevTools
   - Verify API calls to http://localhost:3000

---

## 📦 Build & Deploy

### Production Build

#### API
```bash
cd api
npm run build
npm start
```

#### App (Web)
```bash
cd app
npm run build
# Outputs to app/dist/
```

#### App (Mobile)
```bash
cd app
npm run build
npx cap sync

# Android
cd android
./gradlew assembleRelease

# iOS
cd ios
xcodebuild -scheme App -archivePath ./build/App.xcarchive archive
```

### Environment Variables

#### Production API (.env)
```env
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=your-production-secret
ALLOWED_ORIGINS=https://your-app.com
```

#### Production App (.env)
```env
VITE_API_URL=https://api.your-app.com/api/v1
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-key
```

---

## 🔥 Hot Tips

### Database

**Reset Database**
```bash
cd api
npx prisma migrate reset
npm run db:seed
```

**View All Data**
```bash
npm run db:studio
```

**Generate Types After Schema Change**
```bash
npm run db:generate
```

### API

**Format Code**
```bash
npm run format
```

**Lint**
```bash
npm run lint
```

**Check Types**
```bash
npm run build
```

### App

**Clear Capacitor Cache**
```bash
rm -rf .capacitor
npx cap sync
```

**Update Native Plugins**
```bash
npm update @capacitor/core @capacitor/cli
npx cap sync
```

**Test Offline Mode**
- Use Chrome DevTools > Network > Offline checkbox
- Or disconnect from WiFi

### Sync Queue

**View Queue**
```javascript
// In browser console
import { syncQueue } from '@/modules/sync/sync-queue.service'
const queue = await syncQueue.getPending()
console.log(queue)
```

**Clear Queue**
```javascript
import { syncManager } from '@/modules/sync/sync-manager.service'
await syncManager.clearQueue()
```

**Force Sync**
```javascript
await syncManager.sync()
```

---

## 🚨 Common Issues

### "Cannot find module '@prisma/client'"
```bash
cd api
npm run db:generate
```

### "Database connection failed"
- Check DATABASE_URL in api/.env
- Ensure PostgreSQL is running
- Verify credentials

### "CORS error when calling API"
- Check ALLOWED_ORIGINS in api/.env
- Ensure it includes http://localhost:5173

### "Camera not working"
- HTTPS required for camera access
- Use `npx cap run android` for testing
- Check browser permissions

### "Sync not working"
- Check network connection
- Verify API URL in app/.env
- Check browser console for errors
- View queue: syncQueue.getPending()

---

## 📚 Additional Resources

- [Vue 3 Docs](https://vuejs.org/)
- [Ionic Framework](https://ionicframework.com/docs)
- [Capacitor Docs](https://capacitorjs.com/docs)
- [Fastify Docs](https://www.fastify.io/docs/latest/)
- [Prisma Docs](https://www.prisma.io/docs/)
- [Pinia Docs](https://pinia.vuejs.org/)

---

## 🤝 Getting Help

- Check [CONTRIBUTING.md](../CONTRIBUTING.md)
- Open an issue on GitHub
- Ask in project discussions
- Review existing code examples

---

**Happy Developing! 🎉**
