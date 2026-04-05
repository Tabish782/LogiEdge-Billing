# LogiEdge Billing Assessment

Submission-ready billing dashboard built with React, Express, and MySQL.

## Project structure

- `frontend`: React + Vite user interface
- `backend`: Express API with MySQL integration
- `backend/db.schema.sql`: database schema and seed reference
- `backend/server.js`: backend entry point

## Features

- Dashboard with invoice search and invoice detail view
- Master module for customer and item management
- Billing workflow for customer selection, item selection, quantity updates, and invoice creation
- GST logic based on customer GST registration
- Customer and item update/delete with safe confirmation flow

## Database

- Database engine: MySQL
- Database name: `logiedge_billing`
- Master data aligned to the provided Excel sheet

## Run locally

### Backend

1. Create `backend/.env` from `backend/.env.example`
2. Set your MySQL credentials
3. Start the API:

```bash
cd backend
npm run dev
```

### Frontend

1. Optionally create `frontend/.env` from `frontend/.env.example`
2. Start the app:

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`.

## Notes

- Existing invoices are preserved.
- Customer or item delete is blocked when the record is already used in invoices.
- Built output and template leftovers were intentionally removed to keep the submission clean.
