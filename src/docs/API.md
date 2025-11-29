# API Documentation

## Overview
This document provides comprehensive documentation for the Payment Management System API. The API is built using Firebase Firestore and provides endpoints for managing payments, dues, customers, and analytics.

## Base URL
```
https://api.paymentmanager.com/v1
```

## Authentication
All API requests require authentication using Firebase Authentication tokens.

### Headers
```
Authorization: Bearer <firebase_token>
Content-Type: application/json
```

## Endpoints

### Payments

#### Get All Payments
```http
GET /payments
```

**Query Parameters:**
- `limit` (optional): Number of results to return (default: 50, max: 100)
- `offset` (optional): Number of results to skip
- `status` (optional): Filter by payment status (pending, completed, failed)
- `customerId` (optional): Filter by customer ID
- `startDate` (optional): Filter by start date (ISO 8601)
- `endDate` (optional): Filter by end date (ISO 8601)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "pay_123",
      "amount": 150.00,
      "currency": "USD",
      "status": "completed",
      "paymentMethod": "credit_card",
      "customerId": "cust_456",
      "dueId": "due_789",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

#### Get Payment by ID
```http
GET /payments/{paymentId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "pay_123",
    "amount": 150.00,
    "currency": "USD",
    "status": "completed",
    "paymentMethod": "credit_card",
    "customerId": "cust_456",
    "dueId": "due_789",
    "metadata": {
      "transactionId": "txn_abc123",
      "processor": "stripe"
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Create Payment
```http
POST /payments
```

**Request Body:**
```json
{
  "amount": 150.00,
  "currency": "USD",
  "paymentMethod": "credit_card",
  "customerId": "cust_456",
  "dueId": "due_789",
  "metadata": {
    "transactionId": "txn_abc123"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "pay_123",
    "amount": 150.00,
    "currency": "USD",
    "status": "pending",
    "paymentMethod": "credit_card",
    "customerId": "cust_456",
    "dueId": "due_789",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Update Payment
```http
PUT /payments/{paymentId}
```

**Request Body:**
```json
{
  "status": "completed",
  "metadata": {
    "transactionId": "txn_abc123",
    "processedAt": "2024-01-15T10:35:00Z"
  }
}
```

#### Delete Payment
```http
DELETE /payments/{paymentId}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment deleted successfully"
}
```

### Dues

#### Get All Dues
```http
GET /dues
```

**Query Parameters:**
- `limit` (optional): Number of results to return
- `offset` (optional): Number of results to skip
- `status` (optional): Filter by due status (pending, overdue, paid)
- `customerId` (optional): Filter by customer ID
- `dueDateFrom` (optional): Filter by due date from
- `dueDateTo` (optional): Filter by due date to

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "due_789",
      "amount": 150.00,
      "currency": "USD",
      "status": "pending",
      "customerId": "cust_456",
      "description": "Monthly subscription",
      "dueDate": "2024-01-31",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 75,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

#### Create Due
```http
POST /dues
```

**Request Body:**
```json
{
  "amount": 150.00,
  "currency": "USD",
  "customerId": "cust_456",
  "description": "Monthly subscription",
  "dueDate": "2024-01-31"
}
```

### Customers

#### Get All Customers
```http
GET /customers
```

**Query Parameters:**
- `limit` (optional): Number of results to return
- `offset` (optional): Number of results to skip
- `search` (optional): Search by name or email
- `status` (optional): Filter by customer status (active, inactive)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cust_456",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "status": "active",
      "metadata": {
        "address": "123 Main St",
        "city": "New York",
        "country": "USA"
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 200,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

#### Create Customer
```http
POST /customers
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "metadata": {
    "address": "123 Main St",
    "city": "New York",
    "country": "USA"
  }
}
```

### Analytics

#### Get Dashboard Analytics
```http
GET /analytics/dashboard
```

**Query Parameters:**
- `startDate` (optional): Start date for analytics
- `endDate` (optional): End date for analytics

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalPayments": 1250,
      "totalDues": 850,
      "totalCustomers": 342,
      "totalRevenue": 125000.00,
      "pendingPayments": 45,
      "overdueDues": 23
    },
    "trends": {
      "payments": [
        {"date": "2024-01-01", "count": 45, "amount": 4500.00},
        {"date": "2024-01-02", "count": 52, "amount": 5200.00}
      ],
      "dues": [
        {"date": "2024-01-01", "count": 32, "amount": 3200.00},
        {"date": "2024-01-02", "count": 28, "amount": 2800.00}
      ]
    },
    "paymentMethods": [
      {"method": "credit_card", "count": 850, "amount": 85000.00},
      {"method": "bank_transfer", "count": 400, "amount": 40000.00}
    ]
  }
}
```

#### Get Payment Analytics
```http
GET /analytics/payments
```

**Query Parameters:**
- `startDate` (required): Start date
- `endDate` (required): End date
- `groupBy` (optional): Group by (day, week, month)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalPayments": 1250,
    "totalAmount": 125000.00,
    "averagePayment": 100.00,
    "successRate": 0.95,
    "byPeriod": [
      {
        "period": "2024-01-01",
        "count": 45,
        "amount": 4500.00,
        "successRate": 0.93
      }
    ],
    "byMethod": [
      {
        "method": "credit_card",
        "count": 850,
        "amount": 85000.00,
        "successRate": 0.97
      }
    ]
  }
}
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "amount",
      "message": "Amount must be greater than 0"
    }
  }
}
```

### Error Codes
- `VALIDATION_ERROR`: Request validation failed
- `AUTHENTICATION_ERROR`: Authentication failed
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource conflict
- `INTERNAL_ERROR`: Internal server error
- `RATE_LIMIT_ERROR`: Rate limit exceeded

## Rate Limiting

API requests are rate limited:
- **Authenticated requests**: 1000 requests per hour
- **Anonymous requests**: 100 requests per hour

Rate limit information is included in response headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1640995200
```

## Webhooks

The system supports webhooks for real-time notifications.

### Webhook Events
- `payment.created`: New payment created
- `payment.updated`: Payment status updated
- `payment.completed`: Payment completed
- `payment.failed`: Payment failed
- `due.created`: New due created
- `due.overdue`: Due became overdue
- `customer.created`: New customer created

### Webhook Payload
```json
{
  "event": "payment.completed",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "paymentId": "pay_123",
    "amount": 150.00,
    "status": "completed"
  }
}
```

## SDK Examples

### JavaScript/TypeScript
```javascript
import { PaymentManager } from '@paymentmanager/sdk';

const client = new PaymentManager({
  apiKey: 'your-api-key',
  baseURL: 'https://api.paymentmanager.com/v1'
});

// Get all payments
const payments = await client.payments.list({
  limit: 50,
  status: 'completed'
});

// Create a payment
const payment = await client.payments.create({
  amount: 150.00,
  currency: 'USD',
  customerId: 'cust_456',
  dueId: 'due_789'
});
```

### Python
```python
from paymentmanager import PaymentManager

client = PaymentManager(api_key='your-api-key')

# Get all payments
payments = client.payments.list(limit=50, status='completed')

# Create a payment
payment = client.payments.create(
    amount=150.00,
    currency='USD',
    customer_id='cust_456',
    due_id='due_789'
)
```

## Support

For API support, please contact:
- Email: api-support@paymentmanager.com
- Documentation: https://docs.paymentmanager.com
- Status Page: https://status.paymentmanager.com