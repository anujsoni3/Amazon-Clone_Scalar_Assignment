# Amazon Clone Fullstack Project

A production-grade Amazon-inspired ecommerce platform built for the Scalar SDE Internship Fullstack Assignment.

## Live Deployment

- Frontend: https://amazon-clone-teal-xi.vercel.app
- Backend API: https://amazon-clone-scalar-assignment.onrender.com

## 1. Overview

This project delivers a complete ecommerce workflow with production-oriented engineering practices:

- Product browsing, filtering, sorting, and search
- Product detail experience with buy box and recommendations
- Shopping cart and checkout flow
- Order placement with transactional integrity and stock-safe updates
- Order history and wishlist management
- Account management for profile, saved addresses, and payment methods
- Automated order confirmation emails

## 2. Assignment Coverage

### Mandatory Requirements

| Requirement | Implementation | Status |
|---|---|---|
| Amazon-like user interface | Multi-page storefront with Amazon-inspired layout and navigation | Complete |
| Product listing and detail | Category listing, filters, detail pages, ratings, and pricing | Complete |
| Cart and checkout | Quantity updates, cart summary, checkout confirmation | Complete |
| Order history | Historical order listing with statuses and details | Complete |
| Database design | Relational schema using Prisma ORM and PostgreSQL | Complete |
| Seeded catalog | Realistic seeded catalog with categories, products, and images | Complete |

### Bonus Features

| Feature | Status |
|---|---|
| Responsive design | Complete |
| Wishlist support | Complete |
| Email notification on order placement | Complete |
| Account details and saved addresses | Complete |

## 3. Technology Stack

### Frontend

- React 18 with Vite
- React Router v6
- Axios for API integration
- Socket.io client for real-time updates
- CSS with responsive breakpoints

### Backend

- Node.js with Express
- Prisma ORM
- PostgreSQL (Neon)
- Nodemailer (SMTP)
- Socket.io

### Deployment

- Vercel for frontend hosting
- Render for backend hosting
- Neon PostgreSQL for database

## 4. Architecture

```mermaid
flowchart LR
  U[User Browser] --> FE[React Frontend]
  FE -->|REST API| API[Express Backend]
  API --> DB[(PostgreSQL)]
  API --> SMTP[SMTP Provider]
  API --> WS[Socket.io Events]
  WS --> FE
```

## 5. Order Flow

```mermaid
flowchart TD
  A[User confirms checkout] --> B[Validate shipping payload]
  B --> C[Read cart in transaction]
  C --> D[Check inventory and decrement stock]
  D --> E[Create order and order_items snapshot]
  E --> F[Clear cart]
  F --> G[Emit realtime events]
  G --> H[Trigger order email]
  H --> I[Return success response]
```

## 6. Database Model Summary

```mermaid
erDiagram
  User ||--o{ CartItem : has
  User ||--o{ Order : places
  User ||--o{ Wishlist : saves
  User ||--o{ Review : writes
  User ||--o{ Address : owns
  User ||--o{ PaymentCard : owns

  Category ||--o{ Product : groups
  Product ||--o{ ProductImage : has
  Product ||--o{ CartItem : appears_in
  Product ||--o{ OrderItem : sold_as
  Product ||--o{ Wishlist : saved_as
  Product ||--o{ Review : reviewed_as

  Order ||--o{ OrderItem : contains
```

Design choices:

- Order items store unit price snapshots for historical accuracy
- Shipping address is captured on the order record to preserve checkout-time details
- Address and payment entities support reusable account data

## 7. Screenshot Gallery

### Home

![Home](docs/screenshots/home.png)

### Product Listing

![Product Listing](docs/screenshots/product-listing.png)

### Product Detail

![Product Detail](docs/screenshots/product-detail.png)

### Cart

![Cart](docs/screenshots/cart.png)

### Checkout

![Checkout](docs/screenshots/checkout.png)

### Account

![Account](docs/screenshots/account.png)

### Wishlist

![Wishlist](docs/screenshots/wishlist.png)

### Orders

![Orders](docs/screenshots/orders.png)

### Email Confirmation

![Email Confirmation](docs/screenshots/email-confirmation.png)

### Brainstorming Notes

![Brainstorming Notes](docs/screenshots/brainstorm-ideas.png)

## 8. Local Setup

### Backend

```bash
cd server
npm install
npm run db:seed
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

## 9. Environment Variables

### Server

- DATABASE_URL
- DIRECT_URL
- PORT
- CORS_ORIGIN
- NODE_ENV
- SMTP_HOST
- SMTP_PORT
- SMTP_SECURE
- SMTP_USER
- SMTP_PASS
- MAIL_FROM

### Client

- VITE_API_URL

## 10. Deployment Notes

- Backend deployed on Render as a Web Service rooted at server
- Frontend deployed on Vercel rooted at client
- CORS must include both localhost and deployed frontend domains

## 11. Additional Documentation

- Frontend guide: client/README.md
- Backend guide: server/README.md
- Project report: docs/REPORT.md
- Screenshot checklist: docs/screenshots/README.md
