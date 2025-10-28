# Launchix AI – NestJS Backend

A complete, working NestJS project implementing brand creation, regeneration, assets building, Clerk auth, MongoDB, S3 uploads, Swagger, and production middleware.

## Quick Start

```bash
cp .env.example .env
npm i
docker compose up -d mongo
npm run start:dev
# Swagger -> http://localhost:4242/docs
# Health -> http://localhost:4242/healthz
```

### Auth
Send Clerk session JWT as: `Authorization: Bearer <token>`

### Endpoints
- `GET /healthz`
- `POST /brand/parse`             body: `{ prompt }`
- `POST /brand/:id/regenerate`    body: `{ businessName?, industry?, tagline?, brandStyle? }`
- `POST /brand/:id/build-assets`
- `GET /brand/:id`
- `POST /upload/avatar`           multipart `file` -> S3 public URL
```

### Notes
- Rate limiting via `@nestjs/throttler` (env: `RATE_LIMIT_*`).
- Logging via `nestjs-pino`.
- Global error filter with consistent JSON envelope.
- DALL·E 3 used for 4 logo variants; you can pipe through S3 for durable hosting.
- Website JSON output is GrapesJS-style and colorized by palette.
