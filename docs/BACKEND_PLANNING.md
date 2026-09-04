# Zayna Abaya — Backend Planning & Implementation Spec

## Overview
This document serves as the technical architecture and compliance reference for the **Zayna Abaya** backend, built in conformance with the PRD and the Full-Stack Project Blueprint (v2.2).

## Core Architecture Decisions
1. **Express 5 Alignment**: Express 5.2.1 provides native promise error handling and modern routing.
2. **Recursive NoSQL Injection Defense**: Replaces unmaintained `express-mongo-sanitize` with an Express-5 native middleware recursively stripping `$` and `.` from payloads, backed by strict Zod schema validation on every single incoming body, query, and path parameter.
3. **Authentication Boundary**:
   - Email-based authentication strictly enforced (no third-party / social auth).
   - Password hashing via `bcryptjs` with cost 12.
   - Account lockout: 5 consecutive failed logins enforce a 15-minute lock.
   - Refresh token rotation: Every refresh operation issues a new token pair and rotates the hashed token stored in the session record. Token reuse triggers immediate revocation of all sessions for that account.
   - Access token sent in `Authorization: Bearer <token>`; refresh token stored in `HttpOnly; Secure; SameSite=Strict` cookie.
4. **IDOR & Resource Leakage Elimination**:
   - Every controller accessing customer data uses `assertOwnership()`.
   - Any query attempting to access a resource not belonging to the authenticated user returns `404 Not Found` (never `403 Forbidden`) to prevent resource existence probing.
5. **Payment Processing**:
   - Razorpay orders generated server-side with amounts in smallest currency units (paise).
   - HMAC-SHA256 signature verification performed on raw webhook payloads using `crypto.timingSafeEqual`.
   - Orders cannot be marked paid via client callback; payment must be cryptographically confirmed server-side.
6. **Server-Side Pricing Recalculation**:
   - Cart subtotals, item unit prices, coupons, taxes, and shipping rates are always computed directly from current database records.
   - Client-provided prices are never trusted.

## Security Audit Checklist (Verified)
- [x] All secrets kept in `.env`, strictly excluded from git via root and backend `.gitignore`.
- [x] `.cursorignore` added to keep secrets and build artifacts out of AI indexing.
- [x] Environment parsed and validated with Zod at startup.
- [x] Helmet security headers active (`nosniff`, CSP, etc.).
- [x] CORS origin restricted to configured whitelist.
- [x] Winston production logging redacting all sensitive fields (`password`, `token`, `authorization`, etc.).
- [x] Zero high/critical vulnerabilities confirmed with `npm audit`.
- [x] TypeScript strict mode with zero type errors.
