# API Documentation

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Endpoints

### Health Check

#### `GET /health`
Check API health status.

**Request:**
```bash
curl http://localhost:3000/api/v1/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-04T10:00:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

---

### Products

#### `GET /product/:barcode`
Get product details by barcode.

**Request:**
```bash
curl http://localhost:3000/api/v1/product/1234567890123
```

**Response:**
```json
{
  "barcode": "1234567890123",
  "name": "Wireless Mouse",
  "supplier": "Logitech",
  "warrantyMonths": 24,
  "lastScanned": "2025-11-04T10:00:00.000Z"
}
```

**Error Response (404):**
```json
{
  "ok": false,
  "code": "PRODUCT_NOT_FOUND",
  "message": "Product not found"
}
```

---

#### `POST /product`
Create a new product.

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/product \
  -H "Content-Type: application/json" \
  -d '{
    "barcode": "1234567890123",
    "name": "Wireless Mouse",
    "supplier": "Logitech",
    "warrantyMonths": 24
  }'
```

**Response:**
```json
{
  "ok": true,
  "product": {
    "id": "uuid",
    "barcode": "1234567890123",
    "name": "Wireless Mouse",
    "supplier": "Logitech",
    "warrantyMonths": 24
  }
}
```

**Error Response (409):**
```json
{
  "ok": false,
  "code": "PRODUCT_EXISTS",
  "message": "Product with this barcode already exists"
}
```

---

#### `PATCH /product/:barcode`
Update product details.

**Request:**
```bash
curl -X PATCH http://localhost:3000/api/v1/product/1234567890123 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wireless Mouse Pro",
    "warrantyMonths": 36
  }'
```

**Response:**
```json
{
  "ok": true,
  "product": {
    "id": "uuid",
    "barcode": "1234567890123",
    "name": "Wireless Mouse Pro",
    "supplier": "Logitech",
    "warrantyMonths": 36
  }
}
```

---

### Scans

#### `POST /scan`
Create a new scan record.

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/scan \
  -H "Content-Type: application/json" \
  -d '{
    "barcode": "1234567890123",
    "internalBarcode": "INV-LOGI-1K2M3N4P-5A6B",
    "userId": "user-uuid",
    "timestamp": "2025-11-04T10:00:00.000Z",
    "location": {
      "latitude": 40.7128,
      "longitude": -74.0060
    }
  }'
```

**Response:**
```json
{
  "ok": true,
  "scanId": "scan-uuid",
  "data": {
    "barcode": "1234567890123",
    "internalBarcode": "INV-LOGI-1K2M3N4P-5A6B",
    "userId": "user-uuid",
    "timestamp": "2025-11-04T10:00:00.000Z",
    "productId": "product-uuid",
    "productName": "Wireless Mouse"
  }
}
```

---

#### `GET /scans/:userId`
Get scan history for a user.

**Request:**
```bash
curl http://localhost:3000/api/v1/scans/user-uuid
```

**Response:**
```json
{
  "ok": true,
  "scans": [
    {
      "id": "scan-uuid",
      "barcode": "1234567890123",
      "productName": "Wireless Mouse",
      "supplier": "Logitech",
      "timestamp": "2025-11-04T10:00:00.000Z",
      "userId": "user-uuid"
    }
  ]
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "ok": false,
  "code": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": {},
  "traceId": "request-id"
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `PRODUCT_NOT_FOUND` | 404 | Product doesn't exist |
| `PRODUCT_EXISTS` | 409 | Product already exists |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Request/Response Examples

### Creating a Complete Flow

1. **Create Product**
```bash
curl -X POST http://localhost:3000/api/v1/product \
  -H "Content-Type: application/json" \
  -d '{
    "barcode": "9876543210987",
    "name": "USB-C Cable",
    "supplier": "Anker",
    "warrantyMonths": 12
  }'
```

2. **Scan Product**
```bash
curl -X POST http://localhost:3000/api/v1/scan \
  -H "Content-Type: application/json" \
  -d '{
    "barcode": "9876543210987",
    "internalBarcode": "INV-ANKE-2M3N4P5Q-6B7C",
    "userId": "demo-user-uuid",
    "timestamp": "2025-11-04T10:30:00.000Z"
  }'
```

3. **Get Product Details**
```bash
curl http://localhost:3000/api/v1/product/9876543210987
```

4. **Get User Scan History**
```bash
curl http://localhost:3000/api/v1/scans/demo-user-uuid
```

---

## Rate Limiting

Currently no rate limiting is implemented. In production, consider:
- 100 requests per minute per IP
- 1000 requests per hour per user

---

## Versioning

API version is included in the URL: `/api/v1/`

Future versions will be: `/api/v2/`, etc.

---

## Testing with cURL

### Set Variables
```bash
export API_URL="http://localhost:3000/api/v1"
export USER_ID="demo-user"
```

### Test Health
```bash
curl $API_URL/health
```

### Test Complete Flow
```bash
# Create product
curl -X POST $API_URL/product \
  -H "Content-Type: application/json" \
  -d '{"barcode":"TEST123","name":"Test Product","warrantyMonths":12}'

# Scan it
curl -X POST $API_URL/scan \
  -H "Content-Type: application/json" \
  -d "{\"barcode\":\"TEST123\",\"internalBarcode\":\"INV-TEST-ABC123-XYZ9\",\"userId\":\"$USER_ID\",\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\"}"

# Get details
curl $API_URL/product/TEST123

# Get scans
curl $API_URL/scans/$USER_ID
```

---

## Postman Collection

Import this collection for easy testing:

```json
{
  "info": {
    "name": "Barcode Tracker API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/health",
          "host": ["{{baseUrl}}"],
          "path": ["health"]
        }
      }
    },
    {
      "name": "Get Product",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/product/:barcode",
          "host": ["{{baseUrl}}"],
          "path": ["product", ":barcode"],
          "variable": [
            {
              "key": "barcode",
              "value": "1234567890123"
            }
          ]
        }
      }
    },
    {
      "name": "Create Scan",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"barcode\": \"1234567890123\",\n  \"internalBarcode\": \"INV-LOGI-ABC123-XYZ9\",\n  \"userId\": \"demo-user\",\n  \"timestamp\": \"{{$timestamp}}\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/scan",
          "host": ["{{baseUrl}}"],
          "path": ["scan"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000/api/v1"
    }
  ]
}
```

---

**Last Updated:** November 4, 2025
