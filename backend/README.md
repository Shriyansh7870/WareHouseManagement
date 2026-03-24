# Quantum Invenza — Backend API

Node.js + Express + TypeScript + PostgreSQL + Prisma

## Setup

1. Install dependencies: `npm install`
2. Copy `.env` and configure DATABASE_URL
3. Run database migrations: `npx prisma db push`
4. Seed the database: `npm run db:seed`
5. Start development server: `npm run dev`

## API Endpoints

- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/logout
- GET  /api/auth/me
- GET  /api/inventory
- POST /api/inventory
- GET  /api/inventory/alerts/expiry
- GET  /api/grn
- POST /api/grn
- PATCH /api/grn/:id/qa-decision
- GET  /api/grn/asn
- POST /api/grn/asn
- GET  /api/audit

## Default Credentials

- rahul.mehta@pharmatech.in / Admin@1234 (QA Manager)
- admin@pharmatech.in / Admin@1234 (Admin)
