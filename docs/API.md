# Hub&Hub REST API Reference

Base URLs:
- **Local Development**: `http://localhost:8000`
- **Developer API Prefix**: `/api/v1`
- **Browser Utilities Prefix**: `/api/utilities`
- **Authentication Prefix**: `/api/auth`

---

## 1. System Health & Probes

### GET `/health`
Returns service liveness status and uptime.
```json
{
  "success": true,
  "status": "ok",
  "message": "Hub&Hub API service is running.",
  "uptime": 120,
  "timestamp": "2026-10-11T16:30:00.000Z"
}
```

### GET `/ready`
Tests live connectivity to PostgreSQL pool and Redis cache.
```json
{
  "success": true,
  "status": "ready",
  "checks": {
    "database": true,
    "redis": true
  },
  "timestamp": "2026-10-11T16:30:00.000Z"
}
```

---

## 2. Authentication Endpoints (`/api/auth`)

### POST `/api/auth/register`
Creates a new user account, initializes an authenticated session, and returns HttpOnly cookies.
**Request Body:**
```json
{
  "name": "Alex Vance",
  "email": "alex.vance@developer.io",
  "password": "SuperSecretPassword123!"
}
```
**Response (201 Created):**
```json
{
  "success": true,
  "message": "Account registered successfully.",
  "user": {
    "id": "33ede92e-7d4b-4df9-97cd-4680b49d5977",
    "name": "Alex Vance",
    "email": "alex.vance@developer.io",
    "createdAt": "2026-10-11T16:30:00.000Z"
  },
  "accessToken": "eyJhbGciOi..."
}
```

### POST `/api/auth/login`
Authenticates credentials, updates `last_login_at`, and issues session cookies.
**Request Body:**
```json
{
  "email": "alex.vance@developer.io",
  "password": "SuperSecretPassword123!"
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged in successfully.",
  "user": {
    "id": "33ede92e-7d4b-4df9-97cd-4680b49d5977",
    "name": "Alex Vance",
    "email": "alex.vance@developer.io"
  },
  "accessToken": "eyJhbGciOi..."
}
```

### POST `/api/auth/refresh-token`
Refreshes the access token using the HttpOnly `refreshToken` cookie.

### POST `/api/auth/logout`
Revokes the current session and clears authentication cookies.

### GET `/api/auth/me`
Requires active session or Bearer token. Returns current user profile.

---

## 3. Developer API Key Management (`/api/keys`)
*Requires authenticated session.*

### GET `/api/keys`
Lists all active and revoked API keys belonging to the authenticated user. Never returns raw keys or secret hashes.
```json
{
  "success": true,
  "apiKeys": [
    {
      "id": "c968fbe3-288a-47b2-9a8d-b26b3aaa75d9",
      "name": "Production Microservice Gateway",
      "keyPrefix": "dh_live_8526ea14",
      "maskedKey": "dh_live_8526ea14••••••••••••••••••••••••",
      "createdAt": "2026-10-11T16:30:00.000Z",
      "lastUsedAt": "2026-10-11T16:32:10.000Z",
      "status": "active"
    }
  ]
}
```

### POST `/api/keys`
Generates a new account-level API key. The raw secret key is returned **ONLY ONCE** in this response.
**Request Body:**
```json
{
  "name": "Billing Webhook Worker"
}
```
**Response (201 Created):**
```json
{
  "success": true,
  "message": "API key created successfully. Save your raw key now as it will not be displayed again.",
  "apiKey": {
    "id": "c968fbe3-288a-47b2-9a8d-b26b3aaa75d9",
    "name": "Billing Webhook Worker",
    "keyPrefix": "dh_live_8526ea14",
    "rawKey": "dh_live_8526ea149f1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b",
    "createdAt": "2026-10-11T16:30:00.000Z"
  }
}
```

### DELETE `/api/keys/:id`
Permanently revokes an API key owned by the authenticated user.

---

## 4. Protected Developer Utilities (`/api/v1/*`)
*Requires `x-api-key: dh_live_...` header. Subject to Redis rate limit of 60 req/60s.*

### POST `/api/v1/qr`
Generates custom PNG data URLs or SVG QR codes.
```json
{
  "text": "https://hubhub.dev/quickstart",
  "format": "png",
  "size": 300,
  "margin": 2,
  "errorCorrectionLevel": "H"
}
```

### POST `/api/v1/url-metadata`
SSRF-protected OpenGraph, Twitter Card, and page metadata extraction.
```json
{
  "url": "https://github.com/features/actions"
}
```

### POST `/api/v1/json-validator`
Validates JSON syntax, identifies structural depth and key counts, and pins exact error lines and columns.
```json
{
  "json": "{\"service\": \"Hub&Hub\", \"version\": 2}"
}
```

### POST `/api/v1/json-formatter`
Formats or minifies JSON strings with byte savings metrics.
```json
{
  "action": "minify",
  "input": "{\n  \"a\": 1,\n  \"b\": 2\n}"
}
```

### POST `/api/v1/card-validator`
Luhn-10 mathematical validation and brand identification for Visa, Mastercard, Amex, Discover, and RuPay.
```json
{
  "cardNumber": "4532 7189 2837 1928"
}
```

### POST `/api/v1/password`
Cryptographically secure password and token generator.
```json
{
  "length": 24,
  "hasNumbers": true,
  "hasSymbols": true,
  "hasUppercase": true,
  "hasLowercase": true
}
```

### POST `/api/v1/passwordchecker`
Shannon entropy and password strength analyzer.
```json
{
  "password": "Tr0ub4dor&3_Secure99!"
}
```

---

## 5. Browser Utility Endpoints (`/api/utilities/*`)
Mirror the 4 Core Utilities without requiring developer API keys:
- `POST /api/utilities/qr`
- `POST /api/utilities/url-metadata`
- `POST /api/utilities/json-validator`
- `POST /api/utilities/json-formatter`
- `POST /api/utilities/card-validator`
- `POST /api/utilities/password`
- `POST /api/utilities/passwordchecker`

---

## 6. Standard Error Response

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Descriptive human-readable error explanation.",
  "errors": []
}
```
