# Zayna Abaya — Backend REST API

Production-ready, highly secure REST API for **Zayna Abaya** e-commerce platform built with Node.js, Express 5, TypeScript (strict mode), Mongoose, and MongoDB.

## Features & Architecture

- **Strict TypeScript**: Configured with strict mode, full type-safety, and zero implicit `any`.
- **Email-Based Authentication Only**: Registration, verification, password reset, account lockout (after 5 failed attempts for 15 minutes), and session management.
- **Token Security**: Short-lived access tokens (15m, in header) + long-lived refresh tokens (7d, in `HttpOnly; Secure; SameSite=Strict` cookie) with single-use rotation and breach detection.
- **Defense in Depth**:
  - `helmet` for secure HTTP headers.
  - Explicit CORS allowlist.
  - Express 5-compatible recursive NoSQL sanitizer stripping `$` and `.`.
  - Rate limiting (strict on auth endpoints, global on API, health checks bypassed).
  - `assertOwnership` helper returning `404 Not Found` (never `403`) to eliminate IDOR and resource enumeration.
  - `crypto.timingSafeEqual` used for all token and signature comparisons.
  - AES-256-GCM symmetric encryption utility for stored credentials.
- **E-Commerce Domains**:
  - **Products & Inventory**: Multi-variant support (size, color, SKU), stock tracking, text search index, soft-delete.
  - **Server-Side Pricing**: Never trust frontend prices. Real-time DB lookup for items, coupons, taxes, and shipping calculations.
  - **Razorpay Integration**: Backend order initialization, HMAC-SHA256 signature verification, and idempotent webhook processing.
  - **Customer Hub**: Saved delivery addresses, order tracking, GDPR data export (`GET /users/me/export`).
  - **Multi-Client Brand Configuration**: Configurable brand identity, typography, theme tokens, shipping rates, and feature flags without touching code.

---

## Getting Started

### Prerequisites
- Node.js Active LTS (v24 or v22)
- MongoDB (local instance or MongoDB Atlas)

### 1. Installation
```bash
cd backend
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env` and fill in your variables:
```bash
cp .env.example .env
```

### 3. Development Server
```bash
npm run dev
```

### 4. Build & Typecheck
```bash
npm run typecheck
npm run build
```

### 5. Run Automated Verification Tests
```bash
npm run test:e2e
```

---

## API Endpoints Overview

| Module | Route | Method | Access | Description |
|---|---|---|---|---|
| **Health** | `/health` | `GET` | Public | Liveness check |
| **Health** | `/ready` | `GET` | Public | Readiness check (MongoDB status) |
| **Auth** | `/api/v1/auth/register` | `POST` | Public | Register with verification email |
| **Auth** | `/api/v1/auth/verify-email` | `POST` | Public | Verify account with token |
| **Auth** | `/api/v1/auth/login` | `POST` | Public | Login, receive access token & cookie |
| **Auth** | `/api/v1/auth/refresh` | `POST` | Public | Rotate refresh token cookie |
| **Auth** | `/api/v1/auth/logout` | `POST` | Authenticated | Revoke session & clear cookie |
| **Users** | `/api/v1/users/me` | `GET` | Authenticated | Get customer profile |
| **Users** | `/api/v1/users/me/addresses` | `POST` | Authenticated | Add delivery address |
| **Users** | `/api/v1/users/me/export` | `GET` | Authenticated | GDPR customer data export |
| **Products** | `/api/v1/products` | `GET` | Public | Filter, search, and paginate catalog |
| **Products** | `/api/v1/products/:slug` | `GET` | Public | Product details & related items |
| **Cart** | `/api/v1/cart` | `GET` | Guest/Auth | View cart with recalculated subtotal |
| **Cart** | `/api/v1/cart/items` | `POST` | Guest/Auth | Add item to cart with stock validation |
| **Orders** | `/api/v1/orders` | `POST` | Guest/Auth | Create order with server-side price recalc |
| **Orders** | `/api/v1/orders/track/:orderNumber` | `GET` | Public | Public order tracking |
| **Payments** | `/api/v1/payments/razorpay/order` | `POST` | Guest/Auth | Create Razorpay order |
| **Payments** | `/api/v1/payments/razorpay/verify` | `POST` | Public | Verify HMAC-SHA256 signature |
| **Payments** | `/api/v1/payments/razorpay/webhook` | `POST` | Public | Idempotent webhook handler |
| **Settings** | `/api/v1/settings/public` | `GET` | Public | Store theme, brand & shipping settings |

---

## Postman Testing
Import the postman collection and environment files located in `backend/postman/`:
- `backend/postman/collection.json`
- `backend/postman/environment.json`
