# Hub&Hub System Architecture & Security Design

## 1. System Overview

**Hub&Hub** is a high-concurrency developer utility platform providing:
1. An interactive web client for exploring tools, provisioning API credentials, and monitoring usage quotas.
2. High-performance REST microservice endpoints (`/api/v1/*`) authenticated via account-level API keys.
3. Browser-facing utility endpoints (`/api/utilities/*`) supporting direct interactive client exploration without embedded secret tokens.

```
                              +---------------------------+
                              |   React Frontend (Vite)   |
                              |      (apps/frontend)      |
                              +-------------+-------------+
                                            |
                      Browser Sessions      |      Developer API Requests
                    (HttpOnly JWT Cookies)  |      (x-api-key: dh_live_...)
                                            v
                              +---------------------------+
                              |  Express Gateway & APIs   |
                              |       (apps/backend)      |
                              +-------------+-------------+
                                     /             \
                       Atomic Rate Limit            Transactional Migrations
                       & Active Counters            & Key Prefixes / Users
                                    /                 \
                                   v                   v
                    +--------------------+    +-----------------------+
                    |   Redis Service    |    |  PostgreSQL Database  |
                    |   (Port 6379)      |    |   (Port 5432 / Neon)  |
                    +--------------------+    +-----------------------+
```

---

## 2. Monorepo Organization

The project is structured as an npm workspaces monorepo:

- **`apps/frontend`**: React 19 single-page application using Tailwind CSS and Lucide icons.
- **`apps/backend`**: Node.js 20+ Express modular backend using native ES Modules (`type: module`).
- **`database/migrations`**: Version-controlled SQL migration scripts.
- **`database/migrate.js`**: Transactional, idempotent schema migration runner with audit logging.
- **`tests/`**: Automated test suites for authentication, API keys, Redis rate limiting, and developer utilities.
- **`docs/`**: Architectural blueprints, setup guides, and REST API documentation.
- **`docker-compose.yml`**: Development PostgreSQL 16 and Redis 7 containers.

---

## 3. Dual-Track Authentication Architecture

Hub&Hub explicitly isolates browser web sessions from developer API-key authentication:

### 3.1 Browser Client Authentication (`/api/auth/*`)
- **Transport**: Secure `HttpOnly`, `SameSite=Lax` cookies (`accessToken` and `refreshToken`).
- **Access Token**: Short-lived (15 minutes) signed JSON Web Token containing user ID and email.
- **Refresh Token**: Long-lived (7 days) signed JWT stored in PostgreSQL `sessions` as a bcrypt hash.
- **Brute-Force Protection**: IP-based rate limiting on login/registration endpoints prevents credential stuffing.
- **Credential Safety**: Passwords hashed using bcrypt (cost factor 12). Responses never expose password hashes or sensitive tokens.

### 3.2 Developer API Key System (`/api/v1/*`)
- **Transport**: `x-api-key` HTTP request header or `Authorization: Bearer <key>`.
- **Key Format**: `dh_live_<48-char-hex>` (56 characters total with recognizable prefix).
- **Prefix Storage**: Searchable 16-character prefix `dh_live_XXXXXXXX` indexed in PostgreSQL.
- **Hash Storage**: Cryptographic SHA-256 hash stored in `api_keys(key_hash)`.
- **One-Time Display**: Raw keys are generated client-side and returned *once* upon creation. Subsequent listing queries only return the prefix and a masked preview (`dh_live_...••••••••`).
- **Backward Compatibility**: Supports legacy bcrypt-hashed API keys ($2b$16$...) while utilizing sub-millisecond constant-time SHA-256 for all newly provisioned keys.
- **Ownership Verification**: All key operations strictly check `user_id = req.user.id`. Cross-tenant inspection or revocation is rejected with HTTP 404.
- **Asynchronous Telemetry**: Updates `last_used_at` and records `api_usage` asynchronously on `res.finish`, ensuring analytics queries never delay client responses.

---

## 4. Redis Atomic Rate Limiting

Rate limiting is decoupled from PostgreSQL queries and executed atomically in Redis using an embedded Lua script:

```lua
local current = redis.call("INCR", KEYS[1])
if current == 1 then
  redis.call("EXPIRE", KEYS[1], tonumber(ARGV[1]))
end
local ttl = redis.call("TTL", KEYS[1])
return { current, ttl }
```

### Policy:
- **Quota**: 60 requests per API key per 60-second sliding window.
- **Allowed**: Requests 1 through 60.
- **Rejected**: Request 61+ returns HTTP 429 Too Many Requests with informative JSON error.
- **Headers Returned**:
  - `X-RateLimit-Limit: 60`
  - `X-RateLimit-Remaining: <N>`
  - `X-RateLimit-Reset: <TTL>`
  - `Retry-After: <TTL>` (when 429 is triggered)
- **Production Resilience**: Redis connection errors are explicitly caught; in production, 503 is returned if rate limiting is unavailable, preventing silent security bypasses.

---

## 5. SSRF Defense in Depth

The URL Metadata Extractor (`/api/v1/url-metadata` and `/api/utilities/url-metadata`) implements multi-layered Server-Side Request Forgery protection:

1. **Protocol Restriction**: Only `http:` and `https:` schemes are permitted.
2. **Hostname Blacklisting**: Blocks `localhost`, `*.local`, `*.internal`, and cloud metadata endpoints (`metadata.google.internal`).
3. **DNS Pre-flight Resolution**: Resolves target hostnames against DNS records before initiating HTTP connections.
4. **IP Filtering**: Rejects all resolved IP addresses matching:
   - Loopback (`127.0.0.0/8`, `::1`)
   - RFC 1918 Private networks (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`)
   - Link-local & Cloud Instance Metadata (`169.254.0.0/16`)
   - Carrier-Grade NAT (`100.64.0.0/10`)
   - Unique Local IPv6 (`fc00::/7`, `fe80::/10`)
5. **Payload Truncation**: Enforces a 6-second timeout and 512 KB response buffer cap to neutralize memory/slowloris attacks.

---

## 6. Database Migration & Data Preservation

All PostgreSQL changes are managed via version-controlled SQL files in `database/migrations/`:

- Migrations are tracked in `schema_migrations` (`id`, `name`, `applied_at`).
- Applied sequentially within transactions (`BEGIN ... COMMIT`).
- Idempotent execution (`CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`).
- Existing rows in `users`, `api_keys`, `sessions`, and `api_usage` are preserved during every run.
