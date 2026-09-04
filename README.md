# Zayna Abaya — E-Commerce Platform

Enterprise-grade, full-stack e-commerce platform for **Zayna Abaya** (premium abaya storefront and backoffice).

## Monorepo Layout
```
zayna-abaya-platform/
├── backend/            # Production Express 5 + TypeScript + MongoDB REST API
│   ├── src/            # Source code (modules, middleware, services, utils)
│   ├── postman/        # Postman collection & environment
│   ├── .env.example    # Environment variable template
│   └── package.json    # Verified dependencies
├── frontend/           # Storefront & Admin Next.js app (Ready to build next)
├── docs/               # Architecture specs & blueprint
├── .gitignore          # Root secret & dependency ignore
└── .cursorignore       # AI indexing protection
```

## Quick Start (Backend)
```bash
cd backend
npm install
npm run dev
```

For full setup and API documentation, see [backend/README.md](file:///C:/Users/ASMA%20NAZIYA/.gemini/antigravity/scratch/zayna-abaya-platform/backend/README.md).
