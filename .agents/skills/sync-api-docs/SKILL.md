---
name: sync-api-docs
description: >-
  Automated API documentation & Postman sync engine for Zayna Abaya.
  Use whenever backend API routes, parameters, or schemas are modified to update API_DOCUMENTATION.md and Postman Collection.
---

# Sync API Docs Skill

This skill automatically scans backend API modules and keeps `API_DOCUMENTATION.md` and Postman Workspace synchronized whenever endpoint routes or schemas change.

---

## 🛠️ Execution Command

Run this command whenever you modify, add, or delete any API endpoint or schema:

```powershell
node .agents/skills/sync-api-docs/scripts/generate-api-docs.js
```

Or ask the AI assistant: **"update API docs"** / **"run sync-api-docs skill"**.

---

## 📂 Managed Documentation Artifacts

1. **`API_DOCUMENTATION.md`**: Complete markdown API reference with request/response schemas, status codes (`200`, `201`, `400`, `401`, `403`, `404`, `409`, `429`, `500`), and execution scenarios (Approved, Discarded, Rejected, Revoked).
2. **`zayna_abaya_postman_collection.json`**: Local Postman collection backup.
3. **Live Postman Workspace**: Automatically uploads updated collections to your `zayna abaya` Postman Workspace.
