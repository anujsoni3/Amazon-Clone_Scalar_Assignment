# Server Application

## Overview

Express API for the Amazon Clone assignment with Prisma and PostgreSQL.

## Responsibilities

- Product, category, cart, order, wishlist, review, and account APIs
- Seed pipeline with realistic catalog and order data
- Idempotent order placement and stock-safe transactions
- Order confirmation email dispatch via SMTP

## Scripts

```bash
npm run dev
npm start
npm run db:push
npm run db:seed
npm run db:generate
npm run db:studio
```

## Environment

Copy server/.env.example to server/.env and set values.

Required:

- DATABASE_URL
- DIRECT_URL
- PORT
- CORS_ORIGIN

Optional email:

- SMTP_HOST
- SMTP_PORT
- SMTP_SECURE
- SMTP_USER
- SMTP_PASS
- MAIL_FROM

## API Health

- GET /api/health

## Deployment (Render Web Service)

- Root Directory: server
- Build Command: npm install
- Start Command: npm start
- Add environment variables in Render dashboard
- Set CORS_ORIGIN to both local and frontend URLs if needed, comma-separated
