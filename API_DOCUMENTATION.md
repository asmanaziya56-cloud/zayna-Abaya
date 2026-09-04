# Zayna Abaya Haute Couture — API Reference & Workflow Guide

Comprehensive API documentation for the **Zayna Abaya** platform backend (`http://localhost:5000/api/v1`). Includes HTTP status codes, request/response payloads, and real-world execution scenarios (Approved, Discarded, Rejected, Revoked, Rate Limited).

---

## 📋 Table of Contents
1. [Global HTTP Status Codes & Error Protocol](#1-global-http-status-codes--error-protocol)
2. [Authentication & Session Security (`/auth`)](#2-authentication--session-security-auth)
3. [User & Profile Management (`/users`)](#3-user--profile-management-users)
4. [Catalog & Product Studio (`/products` & `/categories`)](#4-catalog--product-studio-products--categories)
5. [Cart & Coupon Engine (`/cart` & `/coupons`)](#5-cart--coupon-engine-cart--coupons)
6. [Orders & Fulfillment Workflows (`/orders`)](#6-orders--fulfillment-workflows-orders)
7. [Site Settings & Announcement Bar (`/settings`)](#7-site-settings--announcement-bar-settings)

---

## 1. Global HTTP Status Codes & Error Protocol

All API responses follow a standardized JSON envelope:

### ✅ Success Response (2xx)
```json
{
  "success": true,
  "data": { ... }
}
```

### ❌ Error Response (4xx / 5xx)
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED | CONFLICT | INVALID_REQUEST | RATE_LIMIT_EXCEEDED | FORBIDDEN | NOT_FOUND | INTERNAL_ERROR",
    "message": "Human readable explanation"
  }
}
```

### HTTP Status Code Reference

| Status Code | Meaning | Typical Trigger Scenario |
|---|---|---|
| **`200 OK`** | Request succeeded | Data fetched, profile updated, coupon validated, order updated. |
| **`201 Created`** | Resource created | New user registered, product created, order placed, address added. |
| **`400 Bad Request`** | Validation failure | Missing required fields, weak password, invalid coupon parameters. |
| **`401 Unauthorized`** | Authentication missing/invalid | Wrong password, expired JWT token, missing `Authorization: Bearer` header. |
| **`403 Forbidden`** | Permission denied | Customer attempting to access Admin endpoints, suspended account. |
| **`404 Not Found`** | Resource does not exist | Invalid Product ID, Order number not found, Coupon code missing. |
| **`409 Conflict`** | Unique constraint violation | Email address already registered in the system. |
| **`429 Too Many Requests`** | Rate limit exceeded | > 5 failed login attempts (Account locked), > 100 API calls/minute. |
| **`500 Internal Error`** | Server error | Database connection failure, unhandled exception. |

---

## 2. Authentication & Session Security (`/auth`)

### 2.1 `POST /auth/register` — Register New Account
Creates a new customer account.

* **Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "name": "Asma Naziya",
    "email": "asmanaziya@example.com",
    "password": "Password123"
  }
  ```

#### Scenarios:
* **Scenario A — Approved / Account Created (`201 Created`)**:
  ```json
  {
    "success": true,
    "data": {
      "message": "Registration successful. Please verify your email address.",
      "userId": "6a9a89eff61727851a5b146a"
    }
  }
  ```
* **Scenario B — Discarded / Duplicate Email (`409 Conflict`)**:
  ```json
  {
    "success": false,
    "error": {
      "code": "CONFLICT",
      "message": "An account with this email address already exists"
    }
  }
  ```
* **Scenario C — Discarded / Invalid JSON syntax (`400 Bad Request`)**:
  ```json
  {
    "success": false,
    "error": {
      "code": "INVALID_REQUEST",
      "message": "Unexpected token 'a' ... is not valid JSON"
    }
  }
  ```

---

### 2.2 `POST /auth/login` — Authenticate User
Logs in user and sets an `HttpOnly` refresh token cookie.

* **Request Body**:
  ```json
  {
    "email": "asmanaziya@example.com",
    "password": "Password123"
  }
  ```

#### Scenarios:
* **Scenario A — Approved / Login Success (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "_id": "6a9a89eff61727851a5b146a",
        "name": "Asma Naziya",
        "email": "asmanaziya@example.com",
        "role": "customer"
      },
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
  *(Sets `HttpOnly` cookie `refreshToken=...; Max-Age=7 days; SameSite=Strict`)*

* **Scenario B — Rejected / Invalid Credentials (`401 Unauthorized`)**:
  ```json
  {
    "success": false,
    "error": {
      "code": "UNAUTHORIZED",
      "message": "Invalid email or password"
    }
  }
  ```

* **Scenario C — Locked Out / Brute Force Protection (`429 Rate Limit Exceeded`)**:
  *(Triggered after 5 consecutive failed login attempts)*
  ```json
  {
    "success": false,
    "error": {
      "code": "RATE_LIMIT_EXCEEDED",
      "message": "Account is temporarily locked due to multiple failed login attempts. Try again in 15 minute(s)."
    }
  }
  ```

* **Scenario D — Discarded / Suspended Account (`403 Forbidden`)**:
  ```json
  {
    "success": false,
    "error": {
      "code": "FORBIDDEN",
      "message": "Your account has been deactivated or suspended by an administrator."
    }
  }
  ```

---

### 2.3 `POST /auth/refresh` — Single-Flight Token Rotation
Issues a new 15-minute `accessToken` using the valid `refreshToken` cookie.

#### Scenarios:
* **Scenario A — Approved (`200 OK`)**: Returns new `accessToken`.
* **Scenario B — Breach Detected / Discarded Session (`401 Unauthorized`)**:
  *(If an expired or re-used token is submitted, the server revokes all active sessions for that user)*
  ```json
  {
    "success": false,
    "error": {
      "code": "REFRESH_TOKEN_INVALID",
      "message": "Invalid refresh token. All active sessions have been terminated for security."
    }
  }
  ```

---

## 3. User & Profile Management (`/users`)

### 3.1 `PATCH /users/me/email` — Change Account Email
Requires current password verification for security.

* **Headers**: `Authorization: Bearer <accessToken>`
* **Request Body**:
  ```json
  {
    "newEmail": "newemail@example.com",
    "currentPassword": "Password123"
  }
  ```

#### Scenarios:
* **Scenario A — Approved / Email Updated (`200 OK`)**:
  *(Clears refresh cookie; forces user to log in again with new email)*
  ```json
  {
    "success": true,
    "data": {
      "message": "Email updated successfully. Please log in again with your new email.",
      "email": "newemail@example.com"
    }
  }
  ```
* **Scenario B — Rejected / Wrong Password (`401 Unauthorized`)**:
  ```json
  {
    "success": false,
    "error": {
      "code": "UNAUTHORIZED",
      "message": "Current password is incorrect"
    }
  }
  ```
* **Scenario C — Rejected / Email Taken (`409 Conflict`)**:
  ```json
  {
    "success": false,
    "error": {
      "code": "CONFLICT",
      "message": "This email address is already in use by another account"
    }
  }
  ```

---

### 3.2 `PATCH /users/:userId/status` — Deactivate / Suspend User (Admin)

* **Headers**: `Authorization: Bearer <admin_token>`
* **Request Body**: `{ "isActive": false }`

#### Scenarios:
* **Scenario A — Approved / Account Suspended (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": { "_id": "...", "isActive": false },
    "message": "Account suspended & active sessions revoked"
  }
  ```
* **Scenario B — Rejected / Self-Deactivation Blocked (`400 Bad Request`)**:
  ```json
  {
    "success": false,
    "error": {
      "code": "INVALID_REQUEST",
      "message": "You cannot deactivate your own active admin account"
    }
  }
  ```

---

## 4. Catalog & Product Studio (`/products` & `/categories`)

### 4.1 `GET /products` — Query Catalog
Supports search, filtering, and pagination.

* **Query Parameters**:
  * `search=zahra` (Filter by product name)
  * `category=open-front-kimonos` (Filter by category slug/ID)
  * `page=1`, `limit=20`

#### Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "_id": "6a9ab872830bcac65c37ed52",
        "name": "zahra embriodry",
        "sku": "ZA-ZAH-763",
        "price": 234400,
        "stock": 23,
        "category": { "name": "Open Front & Kimonos" }
      }
    ],
    "pagination": { "total": 5, "page": 1, "totalPages": 1 }
  }
}
```

---

## 5. Cart & Coupon Engine (`/cart` & `/coupons`)

### 5.1 `POST /cart/coupon` — Apply Discount Coupon
Validates coupon against subtotal and applies flat/percentage discount.

* **Request Body**: `{ "code": "ZAYNA100" }`

#### Scenarios:
* **Scenario A — Approved / Discount Applied (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "items": [ ... ],
      "coupon": { "code": "ZAYNA100", "discount": 10000 },
      "subtotal": 444400,
      "discountAmount": 10000,
      "totalAmount": 434400
    }
  }
  ```
* **Scenario B — Discarded / Code Not Found (`404 Not Found`)**:
  ```json
  {
    "success": false,
    "error": {
      "code": "NOT_FOUND",
      "message": "Coupon code ZAYNA999 invalid or expired"
    }
  }
  ```
* **Scenario C — Discarded / Minimum Order Not Met (`400 Bad Request`)**:
  ```json
  {
    "success": false,
    "error": {
      "code": "INVALID_REQUEST",
      "message": "Minimum cart subtotal of ₹2,000 required for coupon EID2026"
    }
  }
  ```

---

### 5.2 `DELETE /cart/coupon` — Remove / Discard Coupon
Removes the applied coupon and recalculates full subtotal.

* **Response (`200 OK`)**: Returns updated cart with `discountAmount: 0`.

---

## 6. Orders & Fulfillment Workflows (`/orders`)

### 6.1 `POST /orders` — Create Order / Checkout
Places a new order with items, delivery address, and payment choice.

* **Request Body**:
  ```json
  {
    "items": [
      { "productId": "6a9ab872830bcac65c37ed52", "quantity": 1, "size": "M" }
    ],
    "shippingAddress": {
      "fullName": "Asma Naziya",
      "phone": "9876543210",
      "street": "123 Modest Street",
      "city": "Bangalore",
      "state": "Karnataka",
      "postalCode": "560102",
      "country": "India"
    },
    "paymentMethod": "COD",
    "couponCode": "ZAYNA100"
  }
  ```

#### Scenarios:
* **Scenario A — Approved / Order Created (`201 Created`)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "6a9f123456789",
      "orderNumber": "ZA-20260905-1892",
      "fulfillmentStatus": "pending",
      "paymentStatus": "pending",
      "pricing": { "subtotal": 444400, "discountAmount": 10000, "totalAmount": 434400 }
    }
  }
  ```
* **Scenario B — Discarded / Out of Stock (`400 Bad Request`)**:
  ```json
  {
    "success": false,
    "error": {
      "code": "INVALID_REQUEST",
      "message": "Product 'zahra embriodry' (Size M) is currently out of stock"
    }
  }
  ```

---

### 6.2 `PATCH /orders/:id` — Update Order Fulfillment (Admin Workflow)

* **Request Body**:
  ```json
  {
    "fulfillmentStatus": "shipped",
    "trackingNumber": "AWB987654321",
    "carrier": "BlueDart"
  }
  ```

#### Fulfillment Life-Cycle Scenarios:

```
[pending] ──▶ [processing] ──▶ [shipped] ──▶ [delivered] (Completed)
    │                                
    └──▶ [cancelled] (Discarded Order)
    │
    └──▶ [returned] (Returned & Refunded)
```

* **Approved — Order Shipped (`200 OK`)**: Updates `fulfillmentStatus` to `shipped` and sends tracking email to customer.
* **Approved — Order Delivered (`200 OK`)**: Updates status to `delivered`.
* **Discarded — Order Cancelled (`200 OK`)**: Restores product stock quantities and sets status to `cancelled`.

---

## 7. Site Settings & Announcement Bar (`/settings`)

### 7.1 `PATCH /settings` — Update Storefront & Movable Marquee
Updates global site configurations.

* **Request Body**:
  ```json
  {
    "siteName": "Zayna Abaya Haute Couture",
    "announcementBar": {
      "text": "✨ Complimentary Express Shipping across India on orders above ₹2,999",
      "isActive": true,
      "isMovable": true,
      "scrollSpeed": "medium",
      "textAlign": "center"
    }
  }
  ```

#### Scenarios:
* **Approved (`200 OK`)**: Returns updated settings object. All visitors immediately see the animated marquee banner.
* **Rejected / Non-Admin Access (`403 Forbidden`)**: Blocked if caller is not an Admin/Superadmin.
