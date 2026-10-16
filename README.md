# Kruu — Developer Utility Platform & Microservice Suite

A high-performance, production-hardened developer platform providing an interactive sandbox and developer REST APIs with dual-track authentication, atomic Redis rate limiting, and Server-Side Request Forgery (SSRF) defense.

---

## 🏗️ Architecture & Monorepo Structure

```
hub-hub/
├── apps/
│   ├── backend/                 # Node.js Express API Gateway (ES Modules)
│   │   ├── src/
│   │   │   ├── config/          # DB Pool, Redis Client, Env Validation
│   │   │   ├── controllers/     # Auth, API Keys, Utilities, Analytics
│   │   │   ├── middleware/      # Auth, API Keys, Redis Rate Limiting, Error Handler
│   │   │   ├── routes/          # Browser (/api/auth, /api/utilities) & Dev (/api/v1)
│   │   │   ├── services/        # QR, Metadata, JSON Validator & Formatter
│   │   │   └── utils/           # Crypto, Logger, Tokens, SSRF Shield, Cookies
│   │   └── package.json
│   └── frontend/                # React 19 + Vite + Tailwind CSS Single-Page App
│       ├── src/
│       │   ├── api/             # Authenticated API Client
│       │   ├── components/      # Auth, Profile, DevTools, Playground, Navigation
│       │   ├── context/         # Auth, Session, Billing, and Toast Providers
│       │   └── pages/           # Discovery, My APIs, Sandbox, Marketplace
│       └── package.json
├── database/
│   ├── migrations/              # 001_initial_schema.sql, 002_harden_api_keys.sql
│   └── migrate.js               # Safe, transactional PostgreSQL migration runner
├── docs/
│   ├── ARCHITECTURE.md          # Security model, rate limiting, and design specs
│   ├── API.md                   # Complete REST API reference
│   └── SETUP.md                 # Local development and Docker setup guide
├── tests/                       # Automated Unit & Integration test suites
│   ├── auth.test.js             # Registration, Login, Sessions, Password Hashing
│   ├── apikey.test.js           # Crypto generation, Hash lookup, Ownership, Revocation
│   ├── ratelimit.test.js        # Redis Lua sliding window (60 req / 60s)
│   └── utilities.test.js        # 4 Core Utilities & SSRF Protection Shield
├── docker-compose.yml           # PostgreSQL 16 & Redis 7 development containers
├── .env.example                 # Root environment configuration template
├── package.json                 # Monorepo root with npm workspaces
└── README.md
```

---

## 🛡️ Production Security & Hardening Highlights

1. **Dual-Track Authentication**:
   - **Browser Web Client**: Secure HttpOnly, SameSite cookies containing short-lived JWT access tokens and database-backed session refresh tokens.
   - **Developer REST APIs**: `dh_live_...` high-entropy API keys passed via `x-api-key` header.
2. **API Key Generation & Storage**:
   - Keys generated with 24 cryptographically secure random bytes (`dh_live_` prefix + 48 hex characters).
   - Only the searchable 16-character prefix and modern SHA-256 hash are persisted in PostgreSQL.
   - Raw keys are displayed **only once** upon generation. List and inspection endpoints return masked previews (`dh_live_...••••••••`).
   - Backward compatibility: Seamlessly authenticates legacy bcrypt-hashed keys (`$2b$16$...`) while utilizing sub-millisecond SHA-256 for all newly provisioned keys.
   - Strict backend ownership enforcement on all key operations.
3. **Atomic Redis Lua Rate Limiting**:
   - Default policy: 60 requests per API key per 60-second window.
   - Executed atomically using an embedded Lua script (`INCR` + `EXPIRE`).
   - Rejects request 61+ with HTTP 429 and `Retry-After` header.
   - Sets standard rate limit response headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`).
   - Resilient error handling preventing silent rate-limit bypasses in production.
4. **SSRF Defense in Depth**:
   - Multi-stage validation for URL metadata extraction: restricts schemes to HTTP/S, blacklists local/cloud metadata hostnames, and performs DNS pre-flight checks against loopback, RFC 1918 private subnets, link-local, and carrier-grade NAT address spaces.
5. **Data Preservation & Schema Migrations**:
   - PostgreSQL schema changes managed via transactional migrations tracked in `schema_migrations`.
   - Never drops tables, resets databases, or deletes existing user records.

---

## 🛠️ The 4 Core Developer Utilities

| Utility | Developer API (`/api/v1`) | Browser API (`/api/utilities`) | Description |
| :--- | :--- | :--- | :--- |
| **QR Code Generator** | `POST /api/v1/qr` | `POST /api/utilities/qr` | Vector SVG and PNG Data URLs with custom error correction levels |
| **URL Metadata Extractor**| `POST /api/v1/url-metadata`| `POST /api/utilities/url-metadata` | SSRF-safe OpenGraph, Twitter Card, and page metadata extraction |
| **JSON Validator** | `POST /api/v1/json-validator`| `POST /api/utilities/json-validator` | Syntax verification with exact error line/column and structural metrics |
| **JSON Formatter & Minifier**| `POST /api/v1/json-formatter`| `POST /api/utilities/json-formatter` | Prettify or minify JSON with byte savings and compression calculations |

*Additional utilities include: Credit Card Luhn-10 Validator, Cryptographic Password Generator, and Password Strength Analyzer.*

---

## 🚀 Quickstart & Commands

### 1. Installation
```bash
npm install
```

### 2. Services & Migrations
```bash
# Start PostgreSQL & Redis services via Docker
npm run docker:up

# Execute database migrations
npm run migrate
```

### 3. Run Automated Tests
```bash
npm test
```

### 4. Start Development Servers
```bash
# Start both backend and frontend workspaces
npm run dev

# Or start individually:
npm run dev:backend   # Express API Gateway on http://localhost:8000
npm run dev:frontend  # React Vite on http://localhost:5173
```

### 5. Production Frontend Build
```bash
npm run build:frontend
```

---

## 📜 Documentation

- [Architecture & Security Design](docs/ARCHITECTURE.md)
- [REST API Reference](docs/API.md)
- [Local Development Setup](docs/SETUP.md)
# Kruu-repo-for-intern-s
