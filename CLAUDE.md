# Complete Technical Specification: Barcode Tracking System with Capacitor.js

## Executive Overview

This document provides a comprehensive technical specification for building an enterprise-grade barcode tracking system for inventory management with supplier identification and warranty tracking capabilities. The system leverages Capacitor.js for cross-platform mobile development, enabling deployment to both iOS and Android from a single codebase.

## Table of Contents
1. [System Architecture Overview](#system-architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Mobile Application (Capacitor.js)](#mobile-application-capacitorjs)
4. [Backend API Architecture](#backend-api-architecture)
5. [Database Design](#database-design)
6. [Cloud Infrastructure](#cloud-infrastructure)
7. [Security Implementation](#security-implementation)
8. [UI/UX Design Specifications](#uiux-design-specifications)
9. [ERP Integration Layer](#erp-integration-layer)
10. [Deployment Strategy](#deployment-strategy)
11. [Testing Framework](#testing-framework)
12. [Monitoring & Analytics](#monitoring-analytics)

---

## System Architecture Overview

The system follows a microservices architecture pattern with clear separation of concerns. The mobile application built with Capacitor.js serves as the primary interface for warehouse workers, while a web dashboard provides administrative capabilities. The backend consists of RESTful APIs with WebSocket support for real-time updates, all orchestrated through a cloud-native infrastructure.

### Core Components Flow
```
Mobile App (Capacitor.js) → API Gateway → Microservices → Database
     ↓                           ↓              ↓            ↓
  Local Storage            Load Balancer   Message Queue  Cache Layer
     ↓                           ↓              ↓            ↓
  Offline Mode              Auth Service   ERP Connector  Analytics
```

---

## Technology Stack

### Frontend Technologies
- **Framework**: Vue.js 3 with Composition API (optimal for Capacitor integration)
- **UI Framework**: Ionic Framework 6 (native-like components)
- **State Management**: Pinia (Vue 3 optimized state management)
- **Build Tool**: Vite (fast development and optimized builds)
- **CSS Framework**: Tailwind CSS with custom design system
- **Testing**: Vitest + Cypress for E2E testing

### Mobile Layer (Capacitor.js)
- **Core**: Capacitor 5.x (latest stable version)
- **Plugins Required**:
  - @capacitor/camera (for barcode scanning fallback)
  - @capacitor/filesystem (local data persistence)
  - @capacitor/geolocation (location verification)
  - @capacitor/network (offline mode handling)
  - @capacitor/storage (secure local storage)
  - capacitor-barcode-scanner (primary scanning library)
  - @capacitor/local-notifications (alerts and reminders)

### Backend Technologies
- **Runtime**: Node.js 20 LTS with TypeScript
- **Framework**: NestJS (enterprise-grade architecture)
- **API Protocol**: REST with GraphQL for complex queries
- **Real-time**: Socket.io for live updates
- **Message Queue**: RabbitMQ for async processing
- **Cache**: Redis for session management and caching

### Database Layer
- **Primary Database**: PostgreSQL 15 (ACID compliance for transactions)
- **Document Store**: MongoDB (for flexible log storage)
- **Search Engine**: Elasticsearch (for advanced search capabilities)
- **Cache Database**: Redis (for performance optimization)

### Cloud Infrastructure (AWS-based)
- **Compute**: ECS Fargate (serverless containers)
- **Storage**: S3 (for document and image storage)
- **CDN**: CloudFront (for static assets)
- **Database**: RDS for PostgreSQL, DocumentDB for MongoDB
- **API Gateway**: AWS API Gateway with WAF
- **Queue**: Amazon SQS as alternative to RabbitMQ
- **Monitoring**: CloudWatch with X-Ray for tracing

---

MVP Tasklist

1. Mobile App (Capacitor + Vue + Ionic)

[ ] Setup project
[ ] Initialize Capacitor project
[ ] Integrate Vue 3 with Ionic starter
[ ] Configure Capacitor for iOS and Android

[ ] Implement scanning
[ ] Add ZXing-js for barcode scanning
[ ] Add manual entry fallback form
[ ] Test scan flow on device (iOS + Android)

[ ] Offline storage
[ ] Setup SQLite or Capacitor Storage
[ ] Create queue structure for unsynced scans
[ ] Implement enqueue on failed sync attempt

[ ] Sync logic
[ ] Implement exponential backoff strategy
[ ] Ensure idempotency when retrying
[ ] Add visual indicator for sync status

[ ] Error handling
[ ] Create global error handler (handleError)
[ ] Connect handler to toast notifications
[ ] Add option to log extended details (console or Sentry)

⸻

2. Backend API (Fastify + TypeScript)

[ ] Project setup
[ ] Initialize Fastify with TypeScript
[ ] Add environment config loader
[ ] Setup pino logger with requestId

[ ] Endpoints
[ ] Implement /scan with Zod validation and idempotency
[ ] Implement /product/:barcode returning product details
[ ] Implement /health for uptime checks

[ ] Error strategy
[ ] Define consistent error envelope (code, message, traceId)
[ ] Map known errors (404, 409) to clean responses
[ ] Hide stack traces in production responses

⸻

3. Database (Postgres + Prisma)

[ ] Setup database
[ ] Create Postgres instance (local or cloud)
[ ] Install Prisma and configure schema

[ ] Migrations
[ ] Create products table (id, barcode, name, supplier, warrantyMonths, timestamps)
[ ] Create scans table (id, productId, userId, timestamp)
[ ] Add indexes for barcode and timestamp

[ ] Seeding
[ ] Write seed script for sample products
[ ] Insert realistic supplier and warranty data

⸻

4. Authentication / Infra

[ ] Auth
[ ] Setup Supabase Auth project
[ ] Configure JWT generation and validation
[ ] Add middleware in API to validate JWT
[ ] Connect mobile login flow → Supabase

[ ] Deployment
[ ] Deploy backend to Render or Railway
[ ] Setup environment variables (DB_URL, JWT_SECRET)
[ ] Add healthcheck endpoint for monitoring
[ ] Configure uptime monitor service

⸻

5. Documentation & Onboarding

[ ] README.md
[ ] Add architecture diagram
[ ] Add Quickstart instructions for both app and API
[ ] Add screenshots or GIF of scanning flow

[ ] CONTRIBUTING.md
[ ] Write setup steps for dev environment
[ ] Define pull request rules
[ ] Explain branching and commit guidelines

[ ] Issues
[ ] Create “good first issue” tickets:
[ ] Warranty lookup feature
[ ] Improve error toast UI
[ ] Add retry/backoff exponential logic
[ ] Seed DB with realistic products
[ ] Add sync indicator to mobile UI

⸻

6. Testing & Refactor Rules

[ ] Unit testing
[ ] Write tests for barcode parsing function
[ ] Write tests for internal code generator
[ ] Write tests for sync queue (retry and backoff)

[ ] Integration testing
[ ] Test /scan endpoint end-to-end
[ ] Test /product/:barcode endpoint
[ ] Verify conflict handling (last-write-wins)

[ ] Refactor principles
[ ] Split app into small modules (ScannerService, SyncManager)
[ ] Ensure parsing and generation functions remain pure
[ ] Apply consistent naming rules (nouns for models, verbs for actions)

⸻

7. Roadmap (Post-MVP)

[ ] ERP connector (Priority/SAP) as external service
[ ] Metrics dashboard (logs, monitoring, traceId correlation)
[ ] Build PWA client
[ ] Add background sync and conflict resolution UI
---

## Mobile Application (Capacitor.js)

### Project Structure
```typescript
src/
├── app/
│   ├── modules/
│   │   ├── scanner/
│   │   │   ├── ScannerView.vue
│   │   │   ├── ScannerService.ts
│   │   │   └── BarcodeProcessor.ts
│   │   ├── inventory/
│   │   │   ├── InventoryList.vue
│   │   │   ├── ProductDetail.vue
│   │   │   └── InventoryService.ts
│   │   ├── auth/
│   │   │   ├── LoginView.vue
│   │   │   ├── AuthService.ts
│   │   │   └── TokenManager.ts
│   │   └── sync/
│   │       ├── SyncManager.ts
│   │       ├── OfflineQueue.ts
│   │       └── ConflictResolver.ts
│   ├── shared/
│   │   ├── components/
│   │   ├── services/
│   │   ├── utils/
│   │   └── models/
│   └── core/
│       ├── plugins/
│       ├── interceptors/
│       └── guards/
├── capacitor.config.ts
└── package.json
```

### Core Scanner Implementation
```typescript
// BarcodeScanner.service.ts
import { BarcodeScanner } from 'capacitor-barcode-scanner';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

export class BarcodeScannerService {
  private scanHistory: ScanRecord[] = [];
  private locationValidator: LocationValidator;
  
  async initializeScanner(): Promise<void> {
    // Check permissions first
    const status = await BarcodeScanner.checkPermission({ force: true });
    
    if (!status.granted) {
      throw new Error('Camera permission denied');
    }
    
    // Initialize location services for warehouse verification
    await this.initializeLocationServices();
  }
  
  async scanBarcode(): Promise<ScanResult> {
    try {
      // Verify location before allowing scan
      const location = await this.getCurrentLocation();
      if (!this.isInWarehouse(location)) {
        throw new Error('Scanning only allowed in warehouse premises');
      }
      
      // Prepare UI for scanning
      await this.prepareUI();
      
      // Start scanning
      const result = await BarcodeScanner.startScan();
      
      // Process the scanned data
      const processedData = await this.processBarcode(result.content);
      
      // Store in local database first (offline-first approach)
      await this.storeLocally(processedData);
      
      // Attempt to sync with server
      await this.syncWithServer(processedData);
      
      return {
        success: true,
        data: processedData,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      await this.handleScanError(error);
      throw error;
    } finally {
      await this.restoreUI();
    }
  }
  
  private async processBarcode(rawData: string): Promise<ProcessedBarcode> {
    // Implement barcode parsing logic
    const parser = new BarcodeParser();
    const parsed = parser.parse(rawData);
    
    // Generate internal barcode
    const internalCode = this.generateInternalBarcode({
      originalCode: parsed.code,
      supplierId: await this.identifySupplier(parsed),
      timestamp: Date.now(),
      warehouseId: this.config.warehouseId
    });
    
    return {
      original: parsed,
      internal: internalCode,
      metadata: await this.enrichWithMetadata(parsed)
    };
  }
  
  private generateInternalBarcode(data: BarcodeData): string {
    // Custom barcode generation algorithm
    // Format: [COMPANY_PREFIX]-[SUPPLIER_CODE]-[TIMESTAMP]-[CHECKSUM]
    const prefix = 'INV';
    const supplier = data.supplierId.padStart(4, '0');
    const timestamp = data.timestamp.toString(36).toUpperCase();
    const checksum = this.calculateChecksum(data);
    
    return `${prefix}-${supplier}-${timestamp}-${checksum}`;
  }
}
```

### Offline Synchronization Manager
```typescript
// SyncManager.ts
import { Network } from '@capacitor/network';
import { Storage } from '@capacitor/storage';

export class SyncManager {
  private syncQueue: SyncQueue;
  private conflictResolver: ConflictResolver;
  private retryPolicy: RetryPolicy;
  
  constructor() {
    this.initializeNetworkListener();
    this.setupPeriodicSync();
  }
  
  private async initializeNetworkListener(): Promise<void> {
    Network.addListener('networkStatusChange', async (status) => {
      if (status.connected) {
        await this.processPendingSync();
      }
    });
  }
  
  async queueForSync(operation: SyncOperation): Promise<void> {
    // Store operation in local queue
    await this.syncQueue.enqueue(operation);
    
    // Attempt immediate sync if online
    const networkStatus = await Network.getStatus();
    if (networkStatus.connected) {
      await this.processSingleOperation(operation);
    }
  }
  
  private async processPendingSync(): Promise<void> {
    const pending = await this.syncQueue.getPending();
    
    for (const operation of pending) {
      try {
        await this.processSingleOperation(operation);
        await this.syncQueue.markAsCompleted(operation.id);
      } catch (error) {
        await this.handleSyncError(operation, error);
      }
    }
  }
  
  private async handleConflict(
    local: DataRecord,
    remote: DataRecord
  ): Promise<DataRecord> {
    // Implement conflict resolution strategies
    const strategy = this.getResolutionStrategy(local, remote);
    
    switch (strategy) {
      case 'LAST_WRITE_WINS':
        return local.timestamp > remote.timestamp ? local : remote;
      case 'MERGE':
        return this.mergeRecords(local, remote);
      case 'MANUAL':
        return await this.promptUserResolution(local, remote);
      default:
        throw new Error('Unknown conflict resolution strategy');
    }
  }
}
```

### Capacitor Configuration
```typescript
// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.company.inventorytracker',
  appName: 'Inventory Tracker Pro',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    hostname: 'inventory.local'
  },
  plugins: {
    BarcodeScanner: {
      cameraUsageDescription: "Required for scanning product barcodes",
      formats: ["QR_CODE", "CODE_128", "CODE_39", "EAN_13", "EAN_8"]
    },
    Geolocation: {
      locationAlwaysUsageDescription: "Required to verify warehouse location",
      locationWhenInUseUsageDescription: "Required to verify warehouse location"
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon",
      iconColor: "#488AFF",
      sound: "beep.wav"
    }
  },
  android: {
    allowMixedContent: false,
    minWebViewVersion: 90,
    buildOptions: {
      keystorePath: process.env.KEYSTORE_PATH,
      keystorePassword: process.env.KEYSTORE_PASSWORD,
      keystoreAlias: process.env.KEYSTORE_ALIAS,
      keystoreAliasPassword: process.env.KEYSTORE_ALIAS_PASSWORD
    }
  },
  ios: {
    preferredContentMode: 'mobile',
    limitsNavigationsToAppBoundDomains: true,
    allowsLinkPreview: false
  }
};

export default config;
```

---

## Backend API Architecture

### API Structure (NestJS)
```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Security middleware
  app.use(helmet());
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(','),
    credentials: true
  });
  
  // Global validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true
  }));
  
  // API Documentation
  const config = new DocumentBuilder()
    .setTitle('Inventory Tracking API')
    .setDescription('API for barcode scanning and inventory management')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  await app.listen(process.env.PORT || 3000);
}

bootstrap();
```

### Core API Endpoints
```typescript
// inventory.controller.ts
@Controller('api/v1/inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Inventory')
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly barcodeService: BarcodeService,
    private readonly auditService: AuditService
  ) {}
  
  @Post('scan')
  @Roles(UserRole.WAREHOUSE_WORKER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Process barcode scan' })
  async processScan(
    @Body() scanDto: ScanDto,
    @CurrentUser() user: User,
    @Headers('x-device-id') deviceId: string
  ): Promise<ScanResponse> {
    // Validate location and time constraints
    await this.validateScanContext(scanDto, user);
    
    // Process the scan
    const result = await this.inventoryService.processScan({
      ...scanDto,
      userId: user.id,
      deviceId,
      timestamp: new Date()
    });
    
    // Log audit trail
    await this.auditService.logScan(result, user);
    
    // Emit real-time update
    this.emitInventoryUpdate(result);
    
    return result;
  }
  
  @Get('product/:barcode')
  @ApiOperation({ summary: 'Get product details by barcode' })
  async getProductByBarcode(
    @Param('barcode') barcode: string
  ): Promise<ProductDetail> {
    return this.inventoryService.findByBarcode(barcode);
  }
  
  @Post('generate-internal-barcode')
  @Roles(UserRole.WAREHOUSE_WORKER, UserRole.ADMIN)
  async generateInternalBarcode(
    @Body() generateDto: GenerateBarcodeDto
  ): Promise<InternalBarcodeResponse> {
    const internal = await this.barcodeService.generate(generateDto);
    
    // Store mapping
    await this.inventoryService.mapBarcodes({
      original: generateDto.originalBarcode,
      internal: internal.code,
      supplierId: generateDto.supplierId,
      metadata: generateDto.metadata
    });
    
    return internal;
  }
  
  @Post('batch-import')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async batchImport(
    @UploadedFile() file: Express.Multer.File
  ): Promise<BatchImportResponse> {
    // Process CSV/Excel file for bulk import
    const results = await this.inventoryService.processBatchImport(file);
    
    // Queue for async processing
    await this.queueService.enqueueBatchProcessing(results);
    
    return {
      jobId: results.jobId,
      status: 'PROCESSING',
      totalRecords: results.count
    };
  }
}
```

### WebSocket Implementation for Real-time Updates
```typescript
// inventory.gateway.ts
@WebSocketGateway({
  namespace: 'inventory',
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(','),
    credentials: true
  }
})
export class InventoryGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  
  private activeConnections = new Map<string, SocketMetadata>();
  
  async handleConnection(client: Socket): Promise<void> {
    // Authenticate socket connection
    const token = client.handshake.auth.token;
    const user = await this.authService.validateToken(token);
    
    if (!user) {
      client.disconnect();
      return;
    }
    
    // Store connection metadata
    this.activeConnections.set(client.id, {
      userId: user.id,
      role: user.role,
      warehouseId: user.warehouseId,
      connectedAt: new Date()
    });
    
    // Join appropriate rooms
    client.join(`warehouse:${user.warehouseId}`);
    client.join(`user:${user.id}`);
    
    // Send initial state
    client.emit('connected', {
      serverTime: new Date(),
      warehouse: user.warehouseId
    });
  }
  
  @SubscribeMessage('inventory:update')
  async handleInventoryUpdate(
    @MessageBody() data: InventoryUpdateDto,
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    const metadata = this.activeConnections.get(client.id);
    
    // Broadcast to warehouse room
    this.server.to(`warehouse:${metadata.warehouseId}`).emit('inventory:changed', {
      type: 'UPDATE',
      product: data.product,
      updatedBy: metadata.userId,
      timestamp: new Date()
    });
  }
}
```

---

## Database Design

### PostgreSQL Schema
```sql
-- Core Tables

CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    contact_info JSONB,
    warranty_terms JSONB,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_barcode VARCHAR(100),
    internal_barcode VARCHAR(100) UNIQUE NOT NULL,
    supplier_id UUID REFERENCES suppliers(id),
    product_name VARCHAR(255),
    category VARCHAR(100),
    metadata JSONB,
    status VARCHAR(50) DEFAULT 'AVAILABLE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    INDEX idx_original_barcode (original_barcode),
    INDEX idx_internal_barcode (internal_barcode),
    INDEX idx_supplier (supplier_id),
    INDEX idx_status (status)
);

CREATE TABLE scan_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    user_id UUID REFERENCES users(id),
    action_type VARCHAR(50) NOT NULL, -- 'RECEIVE', 'SELL', 'RETURN', 'CHECK'
    location POINT,
    device_id VARCHAR(100),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    INDEX idx_product (product_id),
    INDEX idx_user (user_id),
    INDEX idx_action (action_type),
    INDEX idx_created (created_at DESC)
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    customer_id UUID REFERENCES customers(id),
    invoice_number VARCHAR(100),
    transaction_type VARCHAR(50),
    amount DECIMAL(10, 2),
    warranty_expiry DATE,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    INDEX idx_invoice (invoice_number),
    INDEX idx_customer (customer_id),
    INDEX idx_warranty (warranty_expiry)
);

-- Audit and Security Tables

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    action VARCHAR(100),
    entity_type VARCHAR(50),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    INDEX idx_user (user_id),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created (created_at DESC)
) PARTITION BY RANGE (created_at);

-- Create monthly partitions for audit logs
CREATE TABLE audit_logs_2024_01 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Function for automatic barcode generation
CREATE OR REPLACE FUNCTION generate_internal_barcode()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.internal_barcode IS NULL THEN
        NEW.internal_barcode := 'INT-' || 
            LPAD(NEW.supplier_id::text, 4, '0') || '-' ||
            TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
            LPAD(nextval('barcode_seq')::text, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_generate_barcode
    BEFORE INSERT ON products
    FOR EACH ROW
    EXECUTE FUNCTION generate_internal_barcode();
```

### MongoDB Schema for Flexible Data
```javascript
// Log Collection Schema
const scanLogSchema = {
  _id: ObjectId,
  timestamp: ISODate,
  userId: String,
  deviceInfo: {
    id: String,
    model: String,
    os: String,
    appVersion: String
  },
  location: {
    type: "Point",
    coordinates: [longitude, latitude],
    accuracy: Number,
    warehouse: String
  },
  scanData: {
    originalBarcode: String,
    internalBarcode: String,
    scanDuration: Number,
    quality: Number
  },
  images: [{
    url: String,
    timestamp: ISODate,
    type: String
  }],
  metadata: Object
};

// Create indexes
db.scanLogs.createIndex({ "timestamp": -1 });
db.scanLogs.createIndex({ "userId": 1, "timestamp": -1 });
db.scanLogs.createIndex({ "location": "2dsphere" });
db.scanLogs.createIndex({ "scanData.internalBarcode": 1 });
```

---

## Cloud Infrastructure

### AWS Infrastructure as Code (Terraform)
```hcl
# main.tf
provider "aws" {
  region = var.aws_region
}

# VPC Configuration
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  
  name = "inventory-tracker-vpc"
  cidr = "10.0.0.0/16"
  
  azs             = ["${var.aws_region}a", "${var.aws_region}b", "${var.aws_region}c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
  
  enable_nat_gateway = true
  enable_vpn_gateway = true
  enable_dns_hostnames = true
  
  tags = {
    Environment = var.environment
    Project = "inventory-tracker"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "inventory-tracker-cluster"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# API Service (Fargate)
resource "aws_ecs_service" "api" {
  name            = "inventory-api"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = var.api_instance_count
  launch_type     = "FARGATE"
  
  network_configuration {
    subnets         = module.vpc.private_subnets
    security_groups = [aws_security_group.api.id]
  }
  
  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "api"
    container_port   = 3000
  }
  
  depends_on = [aws_lb_listener.api]
}

# RDS PostgreSQL
resource "aws_db_instance" "postgres" {
  identifier     = "inventory-db"
  engine         = "postgres"
  engine_version = "15.3"
  instance_class = var.db_instance_class
  
  allocated_storage     = 100
  max_allocated_storage = 1000
  storage_encrypted     = true
  storage_type         = "gp3"
  
  db_name  = "inventory"
  username = var.db_username
  password = random_password.db_password.result
  
  vpc_security_group_ids = [aws_security_group.database.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  backup_retention_period = 30
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  enabled_cloudwatch_logs_exports = ["postgresql"]
  
  tags = {
    Environment = var.environment
  }
}

# ElastiCache Redis
resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "inventory-cache"
  engine              = "redis"
  node_type           = var.redis_node_type
  num_cache_nodes     = 1
  parameter_group_name = "default.redis7"
  engine_version      = "7.0"
  port                = 6379
  
  subnet_group_name = aws_elasticache_subnet_group.main.name
  security_group_ids = [aws_security_group.redis.id]
  
  snapshot_retention_limit = 5
  snapshot_window         = "03:00-05:00"
  
  tags = {
    Environment = var.environment
  }
}

# S3 Buckets
resource "aws_s3_bucket" "uploads" {
  bucket = "${var.project_name}-uploads-${var.environment}"
  
  tags = {
    Environment = var.environment
  }
}

resource "aws_s3_bucket_versioning" "uploads" {
  bucket = aws_s3_bucket.uploads.id
  
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_encryption" "uploads" {
  bucket = aws_s3_bucket.uploads.id
  
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "cdn" {
  origin {
    domain_name = aws_s3_bucket.static.bucket_regional_domain_name
    origin_id   = "S3-static"
    
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.main.cloudfront_access_identity_path
    }
  }
  
  enabled             = true
  is_ipv6_enabled    = true
  default_root_object = "index.html"
  
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-static"
    
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
    
    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }
  
  price_class = "PriceClass_All"
  
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  
  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
```

### Docker Configuration
```dockerfile
# Dockerfile for API
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "dist/main.js"]
```

---

## Security Implementation

### Authentication & Authorization
```typescript
// auth.service.ts
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as speakeasy from 'speakeasy';

@Injectable()
export class AuthService {
  private readonly jwtSecret = process.env.JWT_SECRET;
  private readonly refreshSecret = process.env.REFRESH_SECRET;
  
  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // Check if account is locked
    if (user.loginAttempts >= 5) {
      const lockDuration = 15 * 60 * 1000; // 15 minutes
      const timeSinceLock = Date.now() - user.lastFailedLogin.getTime();
      
      if (timeSinceLock < lockDuration) {
        throw new ForbiddenException('Account temporarily locked');
      }
      
      // Reset attempts after lock period
      await this.resetLoginAttempts(user.id);
    }
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isValid) {
      await this.incrementLoginAttempts(user.id);
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // Verify 2FA if enabled
    if (user.twoFactorEnabled) {
      // This will be handled in a separate step
      return { ...user, requires2FA: true };
    }
    
    await this.resetLoginAttempts(user.id);
    return user;
  }
  
  async verify2FA(userId: string, token: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2
    });
    
    if (!verified) {
      throw new UnauthorizedException('Invalid 2FA token');
    }
    
    return true;
  }
  
  generateTokens(user: User): TokenPair {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      warehouseId: user.warehouseId
    };
    
    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: '15m',
      issuer: 'inventory-tracker',
      audience: 'api'
    });
    
    const refreshToken = jwt.sign(
      { sub: user.id },
      this.refreshSecret,
      { expiresIn: '7d' }
    );
    
    // Store refresh token hash in database
    this.storeRefreshToken(user.id, refreshToken);
    
    return { accessToken, refreshToken };
  }
  
  async validateToken(token: string): Promise<User> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret, {
        issuer: 'inventory-tracker',
        audience: 'api'
      });
      
      return await this.userRepository.findById(decoded.sub);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
```

### API Security Middleware
```typescript
// security.middleware.ts
@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Rate limiting per IP
    const ip = req.ip;
    const key = `rate_limit:${ip}`;
    
    // Implement sliding window rate limiting
    this.rateLimiter.consume(key, 1)
      .then(() => next())
      .catch(() => {
        res.status(429).json({
          error: 'Too many requests',
          retryAfter: 60
        });
      });
  }
}

// Input sanitization
@Injectable()
export class SanitizationPipe implements PipeTransform {
  transform(value: any): any {
    if (typeof value === 'string') {
      // Remove potential XSS vectors
      return this.sanitizeHtml(value);
    }
    
    if (typeof value === 'object') {
      return this.deepSanitize(value);
    }
    
    return value;
  }
  
  private sanitizeHtml(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
  
  private deepSanitize(obj: any): any {
    const sanitized = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = this.transform(obj[key]);
      }
    }
    
    return sanitized;
  }
}
```

---

## UI/UX Design Specifications

### Design System Foundation
```scss
// _variables.scss
:root {
  // Brand Colors
  --color-primary: #2563eb;
  --color-primary-dark: #1d4ed8;
  --color-secondary: #7c3aed;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  
  // Neutral Colors
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;
  
  // Typography
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  // Spacing Scale
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;
  
  // Border Radius
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-full: 9999px;
  
  // Shadows
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
}
```

### Mobile UI Components (Vue 3 + Ionic)
```vue
<!-- ScannerView.vue -->
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Scanner</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="toggleFlashlight">
            <ion-icon :icon="flashlight"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content>
      <div class="scanner-container">
        <!-- Camera preview area -->
        <div class="camera-preview" ref="cameraPreview">
          <div class="scan-overlay">
            <div class="scan-frame">
              <div class="corner top-left"></div>
              <div class="corner top-right"></div>
              <div class="corner bottom-left"></div>
              <div class="corner bottom-right"></div>
            </div>
            <div class="scan-line" :class="{ scanning: isScanning }"></div>
          </div>
          
          <!-- Scan instructions -->
          <div class="scan-instructions">
            <ion-chip color="dark">
              <ion-label>Align barcode within frame</ion-label>
            </ion-chip>
          </div>
        </div>
        
        <!-- Quick actions -->
        <div class="quick-actions">
          <ion-button 
            expand="block" 
            size="large"
            @click="startScan"
            :disabled="isScanning"
          >
            <ion-icon slot="start" :icon="barcodeOutline"></ion-icon>
            {{ isScanning ? 'Scanning...' : 'Start Scan' }}
          </ion-button>
          
          <ion-button 
            expand="block" 
            fill="outline"
            @click="manualEntry"
          >
            <ion-icon slot="start" :icon="keypadOutline"></ion-icon>
            Manual Entry
          </ion-button>
        </div>
        
        <!-- Recent scans -->
        <div class="recent-scans" v-if="recentScans.length">
          <h3>Recent Scans</h3>
          <ion-list>
            <ion-item 
              v-for="scan in recentScans" 
              :key="scan.id"
              @click="viewScanDetails(scan)"
            >
              <ion-thumbnail slot="start">
                <img :src="scan.thumbnail" :alt="scan.code">
              </ion-thumbnail>
              <ion-label>
                <h2>{{ scan.productName }}</h2>
                <p>{{ scan.code }}</p>
                <p>{{ formatTime(scan.timestamp) }}</p>
              </ion-label>
              <ion-badge slot="end" :color="getStatusColor(scan.status)">
                {{ scan.status }}
              </ion-badge>
            </ion-item>
          </ion-list>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, 
  IonContent, IonButton, IonIcon, IonList, 
  IonItem, IonLabel, IonBadge, IonChip,
  IonThumbnail, IonButtons, IonMenuButton
} from '@ionic/vue';
import { 
  barcodeOutline, flashlight, keypadOutline 
} from 'ionicons/icons';
import { useScanner } from '@/composables/useScanner';
import { useHaptics } from '@/composables/useHaptics';

const { 
  startScan, 
  stopScan, 
  isScanning, 
  recentScans 
} = useScanner();

const { vibrate } = useHaptics();

const cameraPreview = ref<HTMLElement>();

const initializeScanner = async () => {
  // Initialize camera preview
  if (cameraPreview.value) {
    await BarcodeScanner.prepare();
    await BarcodeScanner.hideBackground();
    document.body.classList.add('scanner-active');
  }
};

const handleScanSuccess = async (result: ScanResult) => {
  // Haptic feedback
  await vibrate('success');
  
  // Process result
  await processScanResult(result);
};

onMounted(() => {
  initializeScanner();
});

onUnmounted(() => {
  BarcodeScanner.showBackground();
  BarcodeScanner.stopScan();
  document.body.classList.remove('scanner-active');
});
</script>

<style scoped lang="scss">
.scanner-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.camera-preview {
  position: relative;
  flex: 1;
  background: black;
  overflow: hidden;
}

.scan-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scan-frame {
  width: 250px;
  height: 250px;
  position: relative;
  
  .corner {
    position: absolute;
    width: 20px;
    height: 20px;
    border: 3px solid var(--ion-color-primary);
    
    &.top-left {
      top: 0;
      left: 0;
      border-right: none;
      border-bottom: none;
    }
    
    &.top-right {
      top: 0;
      right: 0;
      border-left: none;
      border-bottom: none;
    }
    
    &.bottom-left {
      bottom: 0;
      left: 0;
      border-right: none;
      border-top: none;
    }
    
    &.bottom-right {
      bottom: 0;
      right: 0;
      border-left: none;
      border-top: none;
    }
  }
}

.scan-line {
  position: absolute;
  width: 100%;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--ion-color-primary),
    transparent
  );
  top: 50%;
  transform: translateY(-50%);
  opacity: 0;
  
  &.scanning {
    animation: scan 2s linear infinite;
  }
}

@keyframes scan {
  0% {
    transform: translateY(-125px);
    opacity: 0;
  }
  25% {
    opacity: 1;
  }
  75% {
    opacity: 1;
  }
  100% {
    transform: translateY(125px);
    opacity: 0;
  }
}

.scan-instructions {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.quick-actions {
  padding: var(--space-lg);
  background: var(--ion-background-color);
  
  ion-button {
    margin-bottom: var(--space-md);
  }
}

.recent-scans {
  padding: var(--space-lg);
  
  h3 {
    margin-bottom: var(--space-md);
    color: var(--ion-text-color);
  }
}

// Dark mode support
@media (prefers-color-scheme: dark) {
  .camera-preview {
    background: #000;
  }
  
  .scan-overlay {
    background: rgba(0, 0, 0, 0.5);
  }
}
</style>
```

---

## ERP Integration Layer

### SAP Integration Service
```typescript
// sap.integration.service.ts
import { SAPClient } from 'node-rfc';

@Injectable()
export class SAPIntegrationService {
  private sapClient: SAPClient;
  private syncQueue: Queue;
  
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger
  ) {
    this.initializeSAPConnection();
    this.setupSyncQueue();
  }
  
  private initializeSAPConnection(): void {
    this.sapClient = new SAPClient({
      user: this.configService.get('SAP_USER'),
      passwd: this.configService.get('SAP_PASSWORD'),
      ashost: this.configService.get('SAP_HOST'),
      sysnr: this.configService.get('SAP_SYSTEM_NUMBER'),
      client: this.configService.get('SAP_CLIENT'),
      lang: 'EN'
    });
  }
  
  async syncProduct(product: Product): Promise<void> {
    try {
      await this.sapClient.connect();
      
      // Call SAP RFC for product creation/update
      const result = await this.sapClient.invoke('Z_INVENTORY_SYNC', {
        IV_MATERIAL: product.internal_barcode,
        IV_DESCRIPTION: product.product_name,
        IV_SUPPLIER: product.supplier_code,
        IV_CATEGORY: product.category,
        IV_METADATA: JSON.stringify(product.metadata)
      });
      
      if (result.EV_SUCCESS !== 'X') {
        throw new Error(`SAP sync failed: ${result.EV_MESSAGE}`);
      }
      
      // Update local record with SAP material number
      await this.updateProductWithSAPData(product.id, {
        sap_material_number: result.EV_MATERIAL_NUMBER,
        sap_sync_date: new Date()
      });
      
    } catch (error) {
      this.logger.error('SAP sync error', error);
      
      // Queue for retry
      await this.syncQueue.add('retry-sync', {
        product,
        attempts: 1,
        error: error.message
      });
      
      throw error;
    } finally {
      await this.sapClient.close();
    }
  }
  
  async retrieveInventoryLevels(): Promise<InventoryLevel[]> {
    await this.sapClient.connect();
    
    try {
      const result = await this.sapClient.invoke('Z_GET_INVENTORY_LEVELS', {
        IV_WAREHOUSE: this.configService.get('WAREHOUSE_CODE')
      });
      
      return this.mapSAPInventoryToLocal(result.ET_INVENTORY);
    } finally {
      await this.sapClient.close();
    }
  }
  
  async createSalesOrder(transaction: Transaction): Promise<string> {
    await this.sapClient.connect();
    
    try {
      const result = await this.sapClient.invoke('Z_CREATE_SALES_ORDER', {
        IV_CUSTOMER: transaction.customer_id,
        IV_MATERIAL: transaction.product.sap_material_number,
        IV_QUANTITY: transaction.quantity,
        IV_PRICE: transaction.amount,
        IV_CURRENCY: 'USD',
        IV_WARRANTY_MONTHS: transaction.warranty_months
      });
      
      if (result.EV_SUCCESS !== 'X') {
        throw new Error(`Failed to create sales order: ${result.EV_MESSAGE}`);
      }
      
      return result.EV_SALES_ORDER;
      
    } finally {
      await this.sapClient.close();
    }
  }
}
```

### Priority Integration Service
```typescript
// priority.integration.service.ts
import axios from 'axios';

@Injectable()
export class PriorityIntegrationService {
  private apiClient: AxiosInstance;
  private sessionToken: string;
  
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger
  ) {
    this.initializeAPIClient();
  }
  
  private initializeAPIClient(): void {
    this.apiClient = axios.create({
      baseURL: this.configService.get('PRIORITY_API_URL'),
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Add request interceptor for authentication
    this.apiClient.interceptors.request.use(
      async (config) => {
        if (!this.sessionToken) {
          await this.authenticate();
        }
        config.headers['Authorization'] = `Bearer ${this.sessionToken}`;
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Add response interceptor for token refresh
    this.apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await this.authenticate();
          return this.apiClient.request(error.config);
        }
        return Promise.reject(error);
      }
    );
  }
  
  private async authenticate(): Promise<void> {
    const response = await axios.post(
      `${this.configService.get('PRIORITY_API_URL')}/auth/login`,
      {
        username: this.configService.get('PRIORITY_USER'),
        password: this.configService.get('PRIORITY_PASSWORD'),
        company: this.configService.get('PRIORITY_COMPANY')
      }
    );
    
    this.sessionToken = response.data.token;
  }
  
  async syncProduct(product: Product): Promise<void> {
    try {
      // Check if product exists in Priority
      const existingProduct = await this.findProductByBarcode(
        product.internal_barcode
      );
      
      if (existingProduct) {
        // Update existing product
        await this.apiClient.patch(
          `/LOGPART('${existingProduct.PARTNAME}')`,
          this.mapProductToPriority(product)
        );
      } else {
        // Create new product
        await this.apiClient.post(
          '/LOGPART',
          this.mapProductToPriority(product)
        );
      }
      
    } catch (error) {
      this.logger.error('Priority sync error', error);
      throw new IntegrationError('Failed to sync with Priority', error);
    }
  }
  
  private mapProductToPriority(product: Product): any {
    return {
      PARTNAME: product.internal_barcode,
      PARTDES: product.product_name,
      SUPPLNAME: product.supplier_code,
      FAMILYNAME: product.category,
      CUSTNAME: product.metadata?.custom_field,
      // Add warranty information
      CUSTREAL1: product.warranty_months || 12,
      CUSTCHAR1: product.metadata?.warranty_type || 'STANDARD',
      // Track creation/modification
      CUSTDATE1: new Date().toISOString(),
      CUSTCHAR2: 'BARCODE_SYSTEM'
    };
  }
  
  async createInvoice(transaction: Transaction): Promise<string> {
    const invoice = {
      CUSTNAME: transaction.customer_id,
      CURDATE: new Date().toISOString(),
      DETAILS: {
        PARTNAME: transaction.product.internal_barcode,
        QUANT: transaction.quantity,
        PRICE: transaction.unit_price,
        // Warranty tracking
        CUSTDATE1: transaction.warranty_start_date,
        CUSTDATE2: transaction.warranty_end_date
      }
    };
    
    const response = await this.apiClient.post('/INVOICES', invoice);
    return response.data.IVNUM;
  }
  
  async getWarrantyInfo(barcode: string): Promise<WarrantyInfo> {
    const response = await this.apiClient.get(
      `/LOGPART?$filter=PARTNAME eq '${barcode}'&$expand=INVOICES_SUBFORM`
    );
    
    if (!response.data.value?.[0]) {
      throw new NotFoundError('Product not found in Priority');
    }
    
    const product = response.data.value[0];
    const latestInvoice = product.INVOICES_SUBFORM?.[0];
    
    if (!latestInvoice) {
      throw new NotFoundError('No purchase history found');
    }
    
    return {
      productCode: product.PARTNAME,
      customerName: latestInvoice.CUSTNAME,
      purchaseDate: latestInvoice.CURDATE,
      warrantyEndDate: latestInvoice.CUSTDATE2,
      warrantyStatus: this.calculateWarrantyStatus(latestInvoice.CUSTDATE2),
      supplierCode: product.SUPPLNAME
    };
  }
}
```

---

## Deployment Strategy

### CI/CD Pipeline (GitHub Actions)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY: inventory-tracker
  ECS_SERVICE: inventory-api
  ECS_CLUSTER: inventory-tracker-cluster

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

  build-api:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build and push Docker image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
      
      - name: Update ECS service
        run: |
          aws ecs update-service \
            --cluster ${{ env.ECS_CLUSTER }} \
            --service ${{ env.ECS_SERVICE }} \
            --force-new-deployment

  build-mobile:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          npm ci
          npm install -g @ionic/cli @capacitor/cli
      
      - name: Build web assets
        run: |
          npm run build
          npx cap sync
      
      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          distribution: 'temurin'
          java-version: '17'
      
      - name: Build Android APK
        run: |
          cd android
          ./gradlew assembleRelease
        env:
          ANDROID_KEYSTORE: ${{ secrets.ANDROID_KEYSTORE }}
          KEYSTORE_PASSWORD: ${{ secrets.KEYSTORE_PASSWORD }}
          KEY_ALIAS: ${{ secrets.KEY_ALIAS }}
          KEY_PASSWORD: ${{ secrets.KEY_PASSWORD }}
      
      - name: Upload APK to Google Play
        uses: r0adkll/upload-google-play@v1
        with:
          serviceAccountJsonPlainText: ${{ secrets.GOOGLE_PLAY_SERVICE_ACCOUNT }}
          packageName: com.company.inventorytracker
          releaseFiles: android/app/build/outputs/apk/release/*.apk
          track: internal

  deploy-infrastructure:
    needs: [build-api, build-mobile]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v2
        with:
          terraform_version: 1.5.0
      
      - name: Terraform Init
        run: |
          cd infrastructure
          terraform init
      
      - name: Terraform Plan
        run: |
          cd infrastructure
          terraform plan -out=tfplan
      
      - name: Terraform Apply
        run: |
          cd infrastructure
          terraform apply tfplan
```

---

## Testing Framework

### Unit Testing Strategy
```typescript
// scanner.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ScannerService } from './scanner.service';

describe('ScannerService', () => {
  let service: ScannerService;
  let mockBarcodeRepository: jest.Mocked<BarcodeRepository>;
  let mockSupplierService: jest.Mocked<SupplierService>;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScannerService,
        {
          provide: BarcodeRepository,
          useValue: {
            findByCode: jest.fn(),
            create: jest.fn(),
            update: jest.fn()
          }
        },
        {
          provide: SupplierService,
          useValue: {
            identifySupplier: jest.fn(),
            getWarrantyTerms: jest.fn()
          }
        }
      ]
    }).compile();
    
    service = module.get<ScannerService>(ScannerService);
    mockBarcodeRepository = module.get(BarcodeRepository);
    mockSupplierService = module.get(SupplierService);
  });
  
  describe('processBarcode', () => {
    it('should generate internal barcode for new product', async () => {
      const scanData = {
        originalCode: 'ABC123',
        scannedAt: new Date(),
        userId: 'user-123',
        location: { lat: 0, lng: 0 }
      };
      
      mockBarcodeRepository.findByCode.mockResolvedValue(null);
      mockSupplierService.identifySupplier.mockResolvedValue({
        id: 'SUP001',
        name: 'Supplier A',
        warrantyMonths: 12
      });
      
      const result = await service.processBarcode(scanData);
      
      expect(result.internalCode).toMatch(/^INT-SUP001-\w+-\w+$/);
      expect(mockBarcodeRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          originalCode: 'ABC123',
          internalCode: expect.any(String),
          supplierId: 'SUP001'
        })
      );
    });
    
    it('should handle duplicate scans appropriately', async () => {
      const existingBarcode = {
        id: 'barcode-123',
        originalCode: 'ABC123',
        internalCode: 'INT-SUP001-XYZ-123',
        status: 'ACTIVE'
      };
      
      mockBarcodeRepository.findByCode.mockResolvedValue(existingBarcode);
      
      const result = await service.processBarcode({
        originalCode: 'ABC123',
        scannedAt: new Date(),
        userId: 'user-123'
      });
      
      expect(result.isDuplicate).toBe(true);
      expect(result.internalCode).toBe('INT-SUP001-XYZ-123');
    });
  });
});
```

### E2E Testing
```typescript
// e2e/scanner.e2e-spec.ts
import { test, expect } from '@playwright/test';

test.describe('Barcode Scanner Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'testpass123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
  });
  
  test('should complete full scan workflow', async ({ page }) => {
    // Navigate to scanner
    await page.goto('/scanner');
    
    // Mock camera permissions
    await page.context().grantPermissions(['camera']);
    
    // Mock geolocation
    await page.context().setGeolocation({ 
      latitude: 40.7128, 
      longitude: -74.0060 
    });
    
    // Start scanning
    await page.click('[data-testid="start-scan"]');
    
    // Simulate barcode scan
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('barcode-scanned', {
        detail: { code: 'TEST123456' }
      }));
    });
    
    // Verify scan result
    await expect(page.locator('[data-testid="scan-result"]')).toBeVisible();
    await expect(page.locator('[data-testid="internal-code"]')).toContainText('INT-');
    
    // Confirm and save
    await page.click('[data-testid="confirm-scan"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      'Product successfully registered'
    );
    
    // Check recent scans list
    await expect(
      page.locator('[data-testid="recent-scans"] >> text=TEST123456')
    ).toBeVisible();
  });
  
  test('should handle offline mode', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true);
    
    await page.goto('/scanner');
    
    // Perform scan
    await page.click('[data-testid="start-scan"]');
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('barcode-scanned', {
        detail: { code: 'OFFLINE123' }
      }));
    });
    
    // Verify offline indicator
    await expect(page.locator('[data-testid="offline-badge"]')).toBeVisible();
    
    // Verify data is queued
    await expect(
      page.locator('[data-testid="sync-queue-count"]')
    ).toContainText('1');
    
    // Go back online
    await context.setOffline(false);
    
    // Wait for sync
    await page.waitForSelector('[data-testid="sync-complete"]', {
      timeout: 10000
    });
    
    // Verify queue is cleared
    await expect(
      page.locator('[data-testid="sync-queue-count"]')
    ).toContainText('0');
  });
});
```

---

## Monitoring & Analytics

### Application Performance Monitoring
```typescript
// monitoring.service.ts
import * as Sentry from '@sentry/node';
import { CloudWatch } from 'aws-sdk';
import { StatsD } from 'node-statsd';

@Injectable()
export class MonitoringService {
  private cloudwatch: CloudWatch;
  private statsd: StatsD;
  
  constructor() {
    this.initializeSentry();
    this.initializeCloudWatch();
    this.initializeStatsD();
  }
  
  private initializeSentry(): void {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.Express({ app }),
      ],
    });
  }
  
  private initializeCloudWatch(): void {
    this.cloudwatch = new CloudWatch({
      region: process.env.AWS_REGION
    });
  }
  
  private initializeStatsD(): void {
    this.statsd = new StatsD({
      host: process.env.STATSD_HOST,
      port: 8125,
      prefix: 'inventory.'
    });
  }
  
  // Track scan metrics
  async trackScan(scanData: ScanMetrics): Promise<void> {
    // Send to StatsD for real-time metrics
    this.statsd.increment('scans.total');
    this.statsd.timing('scans.duration', scanData.duration);
    this.statsd.gauge('scans.queue_size', scanData.queueSize);
    
    // Send to CloudWatch for long-term storage
    await this.cloudwatch.putMetricData({
      Namespace: 'InventoryTracker',
      MetricData: [
        {
          MetricName: 'ScanCount',
          Value: 1,
          Unit: 'Count',
          Dimensions: [
            { Name: 'Warehouse', Value: scanData.warehouseId },
            { Name: 'User', Value: scanData.userId }
          ],
          Timestamp: new Date()
        },
        {
          MetricName: 'ScanDuration',
          Value: scanData.duration,
          Unit: 'Milliseconds',
          Dimensions: [
            { Name: 'Warehouse', Value: scanData.warehouseId }
          ],
          Timestamp: new Date()
        }
      ]
    }).promise();
    
    // Track in Sentry for error correlation
    Sentry.addBreadcrumb({
      message: 'Barcode scanned',
      category: 'scan',
      level: 'info',
      data: {
        barcode: scanData.barcode,
        duration: scanData.duration,
        success: scanData.success
      }
    });
  }
  
  // Custom dashboard metrics
  async getAnalytics(timeRange: TimeRange): Promise<Analytics> {
    const metrics = await this.cloudwatch.getMetricStatistics({
      Namespace: 'InventoryTracker',
      MetricName: 'ScanCount',
      Dimensions: [],
      StartTime: timeRange.start,
      EndTime: timeRange.end,
      Period: 3600, // 1 hour
      Statistics: ['Sum', 'Average'],
      Unit: 'Count'
    }).promise();
    
    return this.processMetrics(metrics);
  }
}
```

### Health Check Endpoints
```typescript
// health.controller.ts
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private redis: RedisHealthIndicator,
    private http: HttpHealthIndicator
  ) {}
  
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.redis.pingCheck('redis'),
      () => this.http.pingCheck('sap', process.env.SAP_HEALTH_URL),
      () => this.http.pingCheck('priority', process.env.PRIORITY_HEALTH_URL),
    ]);
  }
  
  @Get('detailed')
  async detailedHealth(): Promise<DetailedHealth> {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkStorage(),
      this.checkERPConnections(),
      this.checkQueueHealth()
    ]);
    
    return {
      status: this.aggregateStatus(checks),
      timestamp: new Date(),
      services: this.mapHealthChecks(checks),
      metrics: await this.getSystemMetrics()
    };
  }
  
  private async getSystemMetrics(): Promise<SystemMetrics> {
    return {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      activeConnections: await this.getActiveConnections(),
      queueSize: await this.getQueueSize(),
      cacheHitRate: await this.getCacheHitRate()
    };
  }
}
```

---

## Summary

This comprehensive technical specification provides everything needed to build a production-ready barcode tracking system using Capacitor.js. The architecture is designed to be scalable, secure, and maintainable, with clear separation of concerns and robust error handling throughout.

Key implementation priorities:
1. Start with the MVP functionality focusing on core scanning and tracking
2. Implement offline-first architecture from the beginning
3. Ensure proper security measures are in place before deployment
4. Build comprehensive testing coverage
5. Set up monitoring and analytics early
6. Plan for ERP integration but implement as a separate phase

The system is designed to handle enterprise-scale operations while remaining flexible enough to adapt to changing business requirements.

