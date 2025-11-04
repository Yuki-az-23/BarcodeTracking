# Barcode Tracking System

> 📡 Scan. Store. Sync. Track inventory with offline-first mobile scanning.

A modern barcode tracking system built with **Capacitor.js** for cross-platform mobile deployment, featuring offline-first architecture and real-time sync capabilities.

## 🎯 Features

- ✅ **Barcode Scanning** - Camera-based scanning with ZXing
- ✅ **Offline-First** - Works without internet, syncs when online
- ✅ **Cross-Platform** - Single codebase for iOS and Android
- ✅ **Real-time Sync** - Automatic synchronization with exponential backoff
- ✅ **Warranty Tracking** - Track supplier and warranty information
- ✅ **Internal Barcodes** - Generate custom internal tracking codes

## 📚 Tech Stack

### Mobile App
- **Capacitor 5** - Native runtime for web apps
- **Vue 3** - Progressive JavaScript framework
- **Ionic Framework** - UI components
- **Pinia** - State management
- **ZXing** - Barcode scanning

### Backend API
- **Fastify** - Fast web framework
- **TypeScript** - Type-safe development
- **Prisma** - Database ORM
- **PostgreSQL** - Relational database
- **Zod** - Schema validation

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+
- **pnpm** or **npm**
- **PostgreSQL** 15+ (or use Supabase)
- **iOS/Android dev tools** (for mobile deployment)

### 1. Clone Repository

```bash
git clone https://github.com/your-username/BarcodeTracking.git
cd BarcodeTracking
```

### 2. Setup Backend API

```bash
cd api

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed

# Start development server
npm run dev
```

The API will be running at `http://localhost:3000`

### 3. Setup Mobile App

```bash
cd app

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your API URL

# Start development server
npm run dev
```

The app will be running at `http://localhost:5173`

### 4. Build for Mobile (Optional)

```bash
# Build web assets
npm run build

# Sync with native platforms
npx cap sync

# Open in native IDE
npm run android  # For Android Studio
npm run ios      # For Xcode
```

## 📁 Project Structure

```
BarcodeTracking/
├── app/                    # Mobile application (Capacitor + Vue)
│   ├── src/
│   │   ├── modules/        # Feature modules (scanner, auth, sync)
│   │   ├── shared/         # Shared components and utilities
│   │   └── core/           # Core plugins and interceptors
│   ├── capacitor.config.ts
│   └── package.json
│
├── api/                    # Backend API (Fastify + TypeScript)
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Custom middleware
│   │   └── utils/          # Utilities
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Seed data
│   └── package.json
│
├── shared/                 # Shared types and constants
│   └── types/
│
└── docs/                   # Documentation
```

## 🔌 API Endpoints

### Health Check
```
GET /api/v1/health
```

### Scan Product
```
POST /api/v1/scan
{
  "barcode": "1234567890123",
  "internalBarcode": "INV-0001-ABC123",
  "userId": "uuid",
  "timestamp": "2025-11-04T10:00:00Z"
}
```

### Get Product Details
```
GET /api/v1/product/:barcode
```

## 🗄️ Database Schema

### Products
- `id` - UUID primary key
- `barcode` - Original barcode (unique)
- `name` - Product name
- `supplier` - Supplier name
- `warrantyMonths` - Warranty period
- `createdAt` / `updatedAt` - Timestamps

### Scans
- `id` - UUID primary key
- `productId` - Foreign key to products
- `userId` - User who scanned
- `timestamp` - When scan occurred

### Users
- `id` - UUID primary key
- `email` - User email (unique)
- `name` - User name
- `role` - User role (admin/user)

## 🧪 Development

### Run Tests
```bash
# API tests
cd api
npm test

# App tests
cd app
npm test
```

### Database Management
```bash
# Open Prisma Studio
npm run db:studio

# Create new migration
npm run db:migrate

# Reset database (development only)
npx prisma migrate reset
```

### Linting & Formatting
```bash
# Lint code
npm run lint

# Format code
npm run format
```

## 📦 Deployment

### Backend (Render/Railway)

1. Create new web service
2. Connect your GitHub repository
3. Set environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `ALLOWED_ORIGINS`
4. Deploy

### Mobile (App Stores)

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed instructions on:
- Building release versions
- App signing
- Submitting to App Store / Play Store

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Good First Issues
- [ ] Add warranty lookup feature
- [ ] Improve error toast UI
- [ ] Enhance retry/backoff logic
- [ ] Add more seed products
- [ ] Improve sync status indicator

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Capacitor](https://capacitorjs.com/) - For making hybrid apps great
- [Ionic Framework](https://ionicframework.com/) - For beautiful UI components
- [Fastify](https://www.fastify.io/) - For blazing fast APIs
- [Prisma](https://www.prisma.io/) - For excellent database tooling

## 📞 Support

- 📧 Email: support@example.com
- 💬 Discord: [Join our community](https://discord.gg/example)
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/BarcodeTracking/issues)

---

Made with ❤️ by the Barcode Tracker Team
