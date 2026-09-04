---
name: zayna-postman-api
description: >-
  Category-wise Postman API suite manager for Zayna Abaya boutique platform.
  Use to generate, refresh, or sync Postman collections with all endpoints, sample JSON bodies, and headers.
---

# Zayna Postman API Suite Skill

This skill manages and synchronizes the complete category-wise API collection for Zayna Abaya in Postman.

---

## 🛠️ Included Operations & Commands

### 1. Sync Collection with Postman Workspace

To automatically build the latest category-wise collection and upload it to your Postman Workspace:

```powershell
node .agents/skills/zayna-postman-api/scripts/sync-postman.js
```

---

## 📂 Collection Architecture & Modules

1. **Auth Module**: `/register`, `/login`, `/refresh`, `/forgot-password`, `/logout`
2. **User & Profile Module**: `/me`, profile update, email update, password update, delivery addresses
3. **Categories Module**: `/categories` (GET & POST)
4. **Products Module**: `/products` (GET paginated, POST with full SKU & pricing payload)
5. **Cart Module**: `/cart`, `/cart/items`, `/cart/coupon` (Apply & Remove)
6. **Coupons & Discounts Module**: `/coupons`, coupon validation
7. **Orders & Checkout Module**: `/orders`, customer order history, checkout payload
8. **Settings & Store Designer**: `/settings/public`, `/settings` (announcement bar, branding, hero designer)

---

## 🔧 Environment Variables

* **`POSTMAN_API_KEY`**: Postman API Key (`PMAK-...`) to authenticate with Postman Cloud API.
* **`POSTMAN_WORKSPACE_ID`**: Target Postman Workspace ID (defaults to `zayna abaya` workspace).
