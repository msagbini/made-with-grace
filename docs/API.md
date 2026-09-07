# 📚 API Reference

Base URL: `http://localhost:3001`

Swagger UI: `http://localhost:3001/api`

## 🏷️ Products

### Get All Categories

```
GET /products/categories
```

Retorna todas las categorías activas.

**Response:**
```json
[
  {
    "id": "cuid123",
    "name": "Galletas con Mensaje",
    "slug": "galletas-mensaje",
    "basePrice": 15.99,
    "description": "Personaliza con tu mensaje"
  }
]
```

### Get Category by Slug

```
GET /products/categories/:slug
```

Retorna una categoría con sus productos.

**Response:**
```json
{
  "id": "cuid123",
  "name": "Galletas con Mensaje",
  "slug": "galletas-mensaje",
  "basePrice": 15.99,
  "products": [
    {
      "id": "prod123",
      "name": "Mini Galleta",
      "slug": "mini-galleta",
      "price": 15.99,
      "customizations": [...]
    }
  ]
}
```

### Get All Products

```
GET /products/list?page=1&limit=20
```

Retorna productos paginados.

**Query Params:**
- `page` (optional): Número de página (default: 1)
- `limit` (optional): Items por página (default: 20, max: 100)

### Get Product by Slug

```
GET /products/:slug
```

Retorna detalles completos de un producto.

**Response:**
```json
{
  "id": "prod123",
  "name": "Mini Galleta",
  "slug": "mini-galleta",
  "categoryId": "cat123",
  "description": "Pequeña galleta personalizada",
  "price": 15.99,
  "customizations": [
    {
      "type": "text",
      "label": "Mensaje",
      "required": true,
      "maxLength": 20
    },
    {
      "type": "color",
      "label": "Color de Glaseado",
      "allowedValues": ["rojo", "azul", "rosa"]
    }
  ]
}
```

---

## 📦 Orders

### Create Order

```
POST /orders
Content-Type: application/json
```

Crea un nuevo pedido.

**Request Body:**
```json
{
  "email": "customer@example.com",
  "name": "Juan Pérez",
  "phone": "+34123456789",
  "address": "Calle Principal 123",
  "city": "Madrid",
  "zip": "28001",
  "country": "ES",
  "deliveryDate": "2024-09-15T00:00:00Z",
  "items": [
    {
      "productId": "prod123",
      "quantity": 6,
      "unitPrice": 15.99,
      "expressApplied": true,
      "customizations": {
        "message": "¡Feliz Cumpleaños!",
        "color": "azul"
      }
    }
  ],
  "subtotal": 95.94,
  "expressFee": 47.97,
  "total": 143.91,
  "notes": "Entregar en la oficina"
}
```

**Response:** (201 Created)
```json
{
  "id": "order123",
  "customerId": "cust123",
  "status": "PENDING",
  "subtotal": 95.94,
  "expressFee": 47.97,
  "total": 143.91,
  "deliveryDate": "2024-09-15T00:00:00Z",
  "createdAt": "2024-09-07T12:00:00Z",
  "items": [...]
}
```

### Get Order by ID

```
GET /orders/:id
```

Retorna detalles de un pedido.

### Get Orders by Email

```
GET /orders/by-email/:email
```

Retorna todos los pedidos de un cliente.

### Cancel Order

```
PUT /orders/:id/cancel
```

Cancela un pedido (solo si no está en producción).

---

## 💳 Payments

### Create Payment Intent

```
POST /payments/intent
Content-Type: application/json
```

Crea un PaymentIntent en Stripe para un pedido.

**Request Body:**
```json
{
  "orderId": "order123",
  "amount": 14391
}
```

**Response:**
```json
{
  "clientSecret": "pi_123_secret_456",
  "publishableKey": "pk_test_123"
}
```

### Handle Webhook

```
POST /payments/webhook
X-Stripe-Signature: [signature]
Content-Type: application/json
```

Procesa webhooks de Stripe (payment confirmations, failures, etc).

**Stripe webhooks esperados:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`

---

## 📁 Files

### Upload File

```
POST /files/upload
Content-Type: multipart/form-data
```

Sube una imagen para personalización.

**Form Data:**
- `file` (required): Archivo de imagen (JPG, PNG, WebP, max 5MB)
- `customerId` (optional): ID del cliente

**Response:**
```json
{
  "id": "file123",
  "storageKey": "uploads/customer123/file-xxx.jpg",
  "url": "https://cdn.example.com/uploads/customer123/file-xxx.jpg",
  "mimeType": "image/jpeg",
  "size": 245632
}
```

---

## 🏥 Health

### Health Check

```
GET /health
```

Verifica si la API está activa.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-09-07T12:00:00Z",
  "uptime": 3600.5
}
```

---

## ⚙️ Admin Endpoints

### List Orders (Admin)

```
GET /orders?status=PENDING&page=1&limit=20
```

Retorna lista de pedidos con filtros.

**Query Params:**
- `status` (optional): PENDING, PAID, IN_PRODUCTION, SHIPPED, etc.
- `page` (optional)
- `limit` (optional)

### Update Order Status (Admin)

```
PUT /orders/:id/status
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "IN_PRODUCTION",
  "notes": "Comenzó la elaboración"
}
```

### Create Product (Admin)

```
POST /products
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Galleta Grande",
  "slug": "galleta-grande",
  "categoryId": "cat123",
  "description": "Galleta grande personalizada",
  "price": 24.99,
  "customizations": [...],
  "active": true,
  "displayOrder": 1
}
```

### Update Product (Admin)

```
PUT /products/:id
Content-Type: application/json
```

### Delete Product (Admin)

```
DELETE /products/:id
```

### Disable Product (Admin)

```
PUT /products/:id/disable
```

Desactiva un producto sin eliminarlo.

---

## Error Handling

Todos los errores devuelven un objeto JSON:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Common Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request (validación)
- `404` - Not Found
- `422` - Validation Error
- `500` - Server Error

---

## Reglas de Negocio

### Cantidades
- Mínimo: 1
- Máximo: 100

### Personalización de Texto
- Máximo: 20 caracteres

### Imágenes
- Máximos tipos: JPG, PNG, WebP
- Tamaño máximo: 5 MB

### Recargo Express
- 50% sobre el subtotal (configurable)
- Garantiza entrega en 24 horas

### Precios
- Se calculan automáticamente server-side
- No confiar en cálculos del cliente
- Validación en cada POST/PUT

---

## Rate Limiting

- Checkout endpoints: 10 requests/minuto por IP
- File upload: 5 requests/minuto por IP
- Auth endpoints: 5 requests/minuto por IP

---

Docs completos: Ver `/swagger/api`
