const https = require('https');
const fs = require('fs');
const path = require('path');

// 1. Read Postman API key from mcp_config.json if available
let apiKey = process.env.POSTMAN_API_KEY || '';
const mcpConfigPath = 'C:/Users/ASMA NAZIYA/.gemini/config/mcp_config.json';

if (fs.existsSync(mcpConfigPath)) {
  try {
    const config = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8'));
    apiKey = config.mcpServers?.Postman?.headers?.['X-Api-Key'] || apiKey;
  } catch (e) {}
}

const workspaceId = process.env.POSTMAN_WORKSPACE_ID || '63042e76-6187-4aa4-8cc6-4cada076be61'; // zayna abaya workspace

if (!apiKey || apiKey.includes('****') || apiKey.includes('XXXX')) {
  console.error('❌ Postman API Key is missing or masked in mcp_config.json.');
  console.error('Provide a valid key via POSTMAN_API_KEY environment variable or mcp_config.json');
  process.exit(1);
}

const collectionData = {
  info: {
    name: "Zayna Abaya API — Complete Studio Collection",
    description: "Category-wise organized endpoints for Zayna Abaya boutique platform with pre-filled request bodies and variables.",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  variable: [
    { key: "baseUrl", value: "http://localhost:5000/api/v1", type: "string" },
    { key: "accessToken", value: "", type: "string" }
  ],
  item: [
    {
      name: "1. Auth Module",
      item: [
        {
          name: "Register New User",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({ name: "Asma Naziya", email: "asmanaziya@example.com", password: "Password123" }, null, 2)
            },
            url: { raw: "{{baseUrl}}/auth/register", host: ["{{baseUrl}}"], path: ["auth", "register"] }
          }
        },
        {
          name: "Login User / Admin",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({ email: "asmanaziya@example.com", password: "Password123" }, null, 2)
            },
            url: { raw: "{{baseUrl}}/auth/login", host: ["{{baseUrl}}"], path: ["auth", "login"] }
          }
        },
        {
          name: "Refresh Access Token",
          request: {
            method: "POST",
            url: { raw: "{{baseUrl}}/auth/refresh", host: ["{{baseUrl}}"], path: ["auth", "refresh"] }
          }
        },
        {
          name: "Forgot Password",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({ email: "asmanaziya@example.com" }, null, 2)
            },
            url: { raw: "{{baseUrl}}/auth/forgot-password", host: ["{{baseUrl}}"], path: ["auth", "forgot-password"] }
          }
        },
        {
          name: "Logout",
          request: {
            method: "POST",
            url: { raw: "{{baseUrl}}/auth/logout", host: ["{{baseUrl}}"], path: ["auth", "logout"] }
          }
        }
      ]
    },
    {
      name: "2. User & Profile Module",
      item: [
        {
          name: "Get My Profile",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{accessToken}}" }],
            url: { raw: "{{baseUrl}}/users/me", host: ["{{baseUrl}}"], path: ["users", "me"] }
          }
        },
        {
          name: "Update Profile Name & Phone",
          request: {
            method: "PATCH",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Authorization", value: "Bearer {{accessToken}}" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({ name: "Asma Naziya", phone: "+919876543210" }, null, 2)
            },
            url: { raw: "{{baseUrl}}/users/me", host: ["{{baseUrl}}"], path: ["users", "me"] }
          }
        },
        {
          name: "Change Account Email",
          request: {
            method: "PATCH",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Authorization", value: "Bearer {{accessToken}}" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({ newEmail: "newemail@example.com", currentPassword: "Password123" }, null, 2)
            },
            url: { raw: "{{baseUrl}}/users/me/email", host: ["{{baseUrl}}"], path: ["users", "me", "email"] }
          }
        },
        {
          name: "Change Account Password",
          request: {
            method: "PATCH",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Authorization", value: "Bearer {{accessToken}}" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({ currentPassword: "Password123", newPassword: "NewPassword123" }, null, 2)
            },
            url: { raw: "{{baseUrl}}/users/me/password", host: ["{{baseUrl}}"], path: ["users", "me", "password"] }
          }
        },
        {
          name: "Add Delivery Address",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Authorization", value: "Bearer {{accessToken}}" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                label: "Home",
                fullName: "Asma Naziya",
                phone: "9876543210",
                street: "123 Modest Street, HSR Layout",
                city: "Bangalore",
                state: "Karnataka",
                postalCode: "560102",
                country: "India",
                isDefault: true
              }, null, 2)
            },
            url: { raw: "{{baseUrl}}/users/me/addresses", host: ["{{baseUrl}}"], path: ["users", "me", "addresses"] }
          }
        }
      ]
    },
    {
      name: "3. Categories Module",
      item: [
        {
          name: "Get All Categories",
          request: {
            method: "GET",
            url: { raw: "{{baseUrl}}/categories", host: ["{{baseUrl}}"], path: ["categories"] }
          }
        },
        {
          name: "Create Category (Admin)",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Authorization", value: "Bearer {{accessToken}}" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                name: "Luxury Silk Abayas",
                description: "Handcrafted pure Nidha silk abayas for special occasions",
                bannerImage: "http://localhost:5000/uploads/banner.jpg"
              }, null, 2)
            },
            url: { raw: "{{baseUrl}}/categories", host: ["{{baseUrl}}"], path: ["categories"] }
          }
        }
      ]
    },
    {
      name: "4. Products Module",
      item: [
        {
          name: "Get All Products",
          request: {
            method: "GET",
            url: {
              raw: "{{baseUrl}}/products?page=1&limit=20",
              host: ["{{baseUrl}}"],
              path: ["products"],
              query: [{ key: "page", value: "1" }, { key: "limit", value: "20" }]
            }
          }
        },
        {
          name: "Create Product (Admin)",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Authorization", value: "Bearer {{accessToken}}" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                name: "Royal Velvet Kaftan",
                sku: "ZA-VEL-001",
                description: "Luxury dark velvet modest kaftan with gold embroidery",
                price: 499900,
                salePrice: 399900,
                stock: 15,
                category: "6a9a73c0800bbe764b278b34",
                tags: ["Kaftan", "Velvet", "Gold", "Luxury"],
                images: ["http://localhost:5000/uploads/zayna-sample.png"],
                flags: { isFeatured: true, isNewArrival: true }
              }, null, 2)
            },
            url: { raw: "{{baseUrl}}/products", host: ["{{baseUrl}}"], path: ["products"] }
          }
        }
      ]
    },
    {
      name: "5. Cart Module",
      item: [
        {
          name: "Get Cart",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{accessToken}}" }],
            url: { raw: "{{baseUrl}}/cart", host: ["{{baseUrl}}"], path: ["cart"] }
          }
        },
        {
          name: "Add Item to Cart",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Authorization", value: "Bearer {{accessToken}}" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({ productId: "6a9ab872830bcac65c37ed52", quantity: 1, size: "M", color: "Black" }, null, 2)
            },
            url: { raw: "{{baseUrl}}/cart/items", host: ["{{baseUrl}}"], path: ["cart", "items"] }
          }
        },
        {
          name: "Apply Coupon",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Authorization", value: "Bearer {{accessToken}}" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({ code: "ZAYNA100" }, null, 2)
            },
            url: { raw: "{{baseUrl}}/cart/coupon", host: ["{{baseUrl}}"], path: ["cart", "coupon"] }
          }
        },
        {
          name: "Remove Coupon",
          request: {
            method: "DELETE",
            header: [{ key: "Authorization", value: "Bearer {{accessToken}}" }],
            url: { raw: "{{baseUrl}}/cart/coupon", host: ["{{baseUrl}}"], path: ["cart", "coupon"] }
          }
        }
      ]
    },
    {
      name: "6. Coupons Module",
      item: [
        {
          name: "Get Coupons (Admin)",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{accessToken}}" }],
            url: { raw: "{{baseUrl}}/coupons", host: ["{{baseUrl}}"], path: ["coupons"] }
          }
        },
        {
          name: "Create Coupon (Admin)",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Authorization", value: "Bearer {{accessToken}}" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                code: "EID2026",
                type: "percentage",
                value: 20,
                minOrderAmount: 200000,
                usageLimit: 100,
                description: "Festive Eid 20% discount"
              }, null, 2)
            },
            url: { raw: "{{baseUrl}}/coupons", host: ["{{baseUrl}}"], path: ["coupons"] }
          }
        },
        {
          name: "Validate Coupon Code",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({ code: "ZAYNA100", subtotal: 300000 }, null, 2)
            },
            url: { raw: "{{baseUrl}}/coupons/validate", host: ["{{baseUrl}}"], path: ["coupons", "validate"] }
          }
        }
      ]
    },
    {
      name: "7. Orders & Checkout",
      item: [
        {
          name: "Get All Orders (Admin)",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{accessToken}}" }],
            url: { raw: "{{baseUrl}}/orders", host: ["{{baseUrl}}"], path: ["orders"] }
          }
        },
        {
          name: "Get My Orders (Customer)",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{accessToken}}" }],
            url: { raw: "{{baseUrl}}/orders/my-orders", host: ["{{baseUrl}}"], path: ["orders", "my-orders"] }
          }
        },
        {
          name: "Create Order (Checkout)",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Authorization", value: "Bearer {{accessToken}}" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                items: [{ productId: "6a9ab872830bcac65c37ed52", quantity: 1, size: "M" }],
                shippingAddress: {
                  fullName: "Asma Naziya",
                  phone: "9876543210",
                  street: "123 Modest Street",
                  city: "Bangalore",
                  state: "Karnataka",
                  postalCode: "560102",
                  country: "India"
                },
                paymentMethod: "COD",
                couponCode: "ZAYNA100"
              }, null, 2)
            },
            url: { raw: "{{baseUrl}}/orders", host: ["{{baseUrl}}"], path: ["orders"] }
          }
        }
      ]
    },
    {
      name: "8. Settings & Store Designer",
      item: [
        {
          name: "Get Public Site Settings",
          request: {
            method: "GET",
            url: { raw: "{{baseUrl}}/settings/public", host: ["{{baseUrl}}"], path: ["settings", "public"] }
          }
        },
        {
          name: "Update Site Settings (Admin)",
          request: {
            method: "PATCH",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Authorization", value: "Bearer {{accessToken}}" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                siteName: "Zayna Abaya Haute Couture",
                announcementBar: {
                  text: "✨ Free Express Delivery on orders above ₹2,999",
                  isActive: true,
                  isMovable: true,
                  scrollSpeed: "medium",
                  textAlign: "center"
                }
              }, null, 2)
            },
            url: { raw: "{{baseUrl}}/settings", host: ["{{baseUrl}}"], path: ["settings"] }
          }
        }
      ]
    }
  ]
};

// 1. Export local copy
const localPath = path.resolve(__dirname, '../../../zayna_abaya_postman_collection.json');
fs.writeFileSync(localPath, JSON.stringify(collectionData, null, 2));
console.log('✅ Exported local collection file:', localPath);

// 2. Upload/Sync to Postman Workspace via API
const payload = JSON.stringify({ collection: collectionData });

const req = https.request({
  hostname: 'api.getpostman.com',
  path: '/collections?workspace=' + workspaceId,
  method: 'POST',
  headers: {
    'X-Api-Key': apiKey,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
}, res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('🚀 Successfully synced collection to Postman Workspace!');
    } else {
      console.log('HTTP Status:', res.statusCode, data);
    }
  });
});

req.on('error', err => console.error('Sync failed:', err.message));
req.write(payload);
req.end();
