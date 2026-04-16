# Amazon Clone Fullstack Project

A production-grade Amazon-inspired ecommerce platform built for the Scalar SDE Internship Fullstack Assignment. The application demonstrates comprehensive fullstack development practices including responsive UI, robust API design, transactional integrity, and cloud deployment.

**🚀 Live Deployment:**
- **Frontend:** [https://amazon-clone-teal-xi.vercel.app](https://amazon-clone-teal-xi.vercel.app)
- **Backend API:** [https://amazon-clone-scalar-assignment.onrender.com](https://amazon-clone-scalar-assignment.onrender.com)

## 1. Overview

This project implements a complete ecommerce platform with production-quality architecture, demonstrating:

- **User Experience:** Product browsing, filtering, search, detailed product views, shopping cart, and checkout
- **Business Logic:** Order placement with idempotency guarantees, inventory management, stock protection, and transaction integrity
- **Account Management:** User profiles, saved addresses, payment methods, order history, and wishlists
- **Notifications:** Automated order confirmation emails with branded HTML templates
- **Scalability:** Cloud-based deployment on Render (backend) and Vercel (frontend) with serverless PostgreSQL (Neon)

## 2. Assignment Requirements & Coverage

### Mandatory Requirements

| Requirement | Implementation | Status |
|---|---|---|
| Amazon-like user interface | Responsive design with Amazon color scheme and layout patterns | ✅ Complete |
| Product browsing and filtering | Category-based navigation, search, sorting by price/rating | ✅ Complete |
| Product detail pages | High-fidelity buy box, product images, reviews, recommendations | ✅ Complete |
| Shopping cart management | Add/remove items, cart persistence, quantity updates | ✅ Complete |
| Checkout flow | Shipping address selection, order summary, payment integration placeholder | ✅ Complete |
| Order history | User order tracking with statuses and order details | ✅ Complete |
| Database schema design | 11-entity relational model with Prisma ORM (see ER diagram) | ✅ Complete |
| Seeded catalog | 250+ products across 30 categories with 724 product images | ✅ Complete |

### Bonus Features

| Feature | Implementation | Status |
|---|---|---|
| Responsive design | Mobile, tablet, and desktop layouts with CSS media queries | ✅ Complete |
| Order history page | Timeline view with order statuses and item details | ✅ Complete |
| Wishlist functionality | Add/remove saved products with persistent storage | ✅ Complete |
| Email notifications | Automated order confirmation emails with branded HTML template | ✅ Complete |
| Advanced search/filtering | Multi-criteria filtering, dynamic sorting, category drilldown | ✅ Complete |

## 3. Technology Stack

### Frontend
- **Framework:** React 18 with Vite build tool
- **Routing:** React Router v6 for SPA navigation
- **State Management:** React Context API for cart and app state
- **HTTP Client:** Axios with interceptor-based error handling
- **Real-time Events:** Socket.io client for live order updates
- **Styling:** CSS3 with mobile-first responsive design

### Backend
- **Runtime:** Node.js with Express.js framework
- **Database ORM:** Prisma (type-safe, auto-migrated schema)
- **Database:** PostgreSQL (Neon serverless for deployment)
- **Email Service:** Nodemailer with Gmail SMTP
- **Real-time Communication:** Socket.io for event broadcasting
- **Rate Limiting:** Custom middleware for API protection

### Infrastructure & Deployment
- **Frontend Hosting:** Vercel (edge-deployed React SPA)
- **Backend Hosting:** Render.com (managed Node.js service)
- **Database Hosting:** Neon PostgreSQL (serverless, auto-scaling)
- **Version Control:** GitHub with commit-based CI/CD triggers
- **Environment Management:** .env files with example templates

## 4. Directory Structure

```
Amazon-Clone/
├── client/                    # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route-level components
│   │   ├── context/          # React Context (cart, auth state)
│   │   ├── services/         # API client functions
│   │   └── styles/           # Global CSS and variables
│   ├── package.json          # Frontend dependencies
│   └── vite.config.js        # Vite build configuration
├── server/                    # Express.js backend API
│   ├── src/
│   │   ├── controllers/      # Business logic and route handlers
│   │   ├── routes/           # API endpoint definitions
│   │   ├── middleware/       # Express middleware (auth, errors)
│   │   ├── lib/              # Utilities (mailer, socket, validators)
│   │   └── app.js            # Express app initialization
│   ├── prisma/               # Database schema and migrations
│   ├── package.json          # Backend dependencies
│   └── .env.example          # Environment template
├── docs/                      # Documentation and assets
│   ├── REPORT.md             # Formal project report
│   └── screenshots/          # Project screenshots and checklist
├── render.yaml               # Render deployment blueprint
└── README.md                 # This file

## 5. Architecture Diagram

```mermaid
flowchart LR
  U[User Browser] --> FE[React Frontend]
  FE -->|REST API| API[Express Backend]
  API --> DB[(PostgreSQL)]
  API --> SMTP[SMTP Provider]
  API --> WS[Socket.io Events]
  WS --> FE
```

## 6. Order Flow Diagram

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

## 7. Database Design (ER Summary)

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

### Schema Design Rationale

| Design Decision | Rationale |
|---|---|
| Order items store unit price snapshots | Ensures order history reflects historical pricing, not current catalog prices |
| Shipping address persisted as JSON | Maintains order immutability; addresses can be archived without affecting orders |
| Separate Address and PaymentCard models | Supports account management UX (saved for future purchases) |
| Product images as separate entity | Allows multiple images per product without database denormalization |
| Wishlist as many-to-many | Supports user collections without impacting cart/order logic |

## 8. Development Approach & Implementation Details

## 8. Development Approach & Key Decisions

### Email Notifications & Order Confirmation

- **Asynchronous Dispatch:** Non-blocking email sending after order creation ensures checkout completes instantly
- **Provider:** Nodemailer with Gmail SMTP configured for production reliability
- **Template:** Branded HTML email with order summary, item details, unit prices, quantities, and shipping address
- **Fallback:** Plain-text version for compatibility with text-only email clients
- **Error Handling:** Failed email deliveries logged but don't block order placement; admin alerts can be configured

### Address & Shipping Management

- **Saved Addresses:** User account stores frequently-used addresses for checkout autofill
- **Checkout Flow:** Users can select from saved addresses or enter a new address at purchase time
- **Data Persistence:** Addresses stored as individual records in database for account management
- **Order Snapshot:** Shipping address copied to order record at checkout (immutable historical reference)

### Deployment Architecture & Cloud Infrastructure

- **Frontend:** React SPA deployed on Vercel for edge-optimized delivery, automatic deployments on GitHub pushes
- **Backend:** Node.js + Express hosted on Render Web Service with auto-scaling capabilities
- **Database:** PostgreSQL on Neon (serverless, auto-scaling, connection pooling) for cost-effective production storage
- **Environment Configuration:** CORS dynamically configured to support localhost (development) and Vercel URL (production)
- **Simplification:** Redis removed in favor of stateless API design; session/cache logic handled via database or frontend Context

### Data Seeding & Catalog Management

- **Comprehensive Dataset:** 250+ products with realistic metadata (titles, prices, ratings)
- **Category Organization:** 30 product categories with proper groupings (Electronics, Home & Kitchen, Books, etc.)
- **Product Media:** 724 product images pre-seeded for visual richness; easily extensible
- **Sample Orders:** Pre-populated orders with various statuses for order history testing
- **Test Data:** User addresses and payment methods included to demonstrate account features
- **Seed Execution:** Automated during `npm run db:seed` (local) or Render build process (production)

### Frontend Features & User Experience

- **Wishlist:** Persistent product collections with add/remove functionality
- **Order History:** Timeline view of user orders with status tracking (Pending, Shipped, Delivered)
- **Account Management:** Profile page with editable addresses, saved payment methods, and preferences
- **Responsive Design:** Mobile-first CSS with breakpoints for tablet (768px) and desktop (1024px+)
- **Search & Filtering:** Category-based navigation, text search, price range filtering, ratings-based sorting

## 9. Screenshots and Evidence

This repository includes a dedicated screenshot guide in [docs/screenshots/README.md](docs/screenshots/README.md) with the recommended filenames and capture checklist.

The screenshots folder also includes the development brainstorming image referenced as `brainstorm-ideas.png` for process documentation.

## 10. Local Setup

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

## 11. Environment Variables

### server/.env

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

### client/.env

- VITE_API_URL
## 10. Local Development Setup

### Prerequisites

- Node.js 16+ with npm
- PostgreSQL 12+ (or use local PostgreSQL Docker container)
- Git for version control

### Backend Configuration

```bash
cd server
npm install                    # Install dependencies
npm run db:seed               # Populate database with sample data
npm run dev                   # Start development server (port 5000)
```

The backend will be available at `http://localhost:5000/api`.

### Frontend Configuration

```bash
cd client
npm install                    # Install dependencies
npm run dev                    # Start Vite dev server (port 5173)
```

The frontend will be available at `http://localhost:5173`.

### Useful Scripts

**Backend:**
- `npm run dev` - Development server with auto-reload
- `npm start` - Production server
- `npm run db:seed` - Re-seed the database
- `npm run db:reset` - Drop and recreate all tables

**Frontend:**
- `npm run dev` - Development server with HMR
- `npm run build` - Production build
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

## 11. Environment Configuration

### Backend Environment Variables (.env)

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | Primary PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `DIRECT_URL` | Direct database connection (required by Prisma) | Same as DATABASE_URL |
| `PORT` | Server port number | `5000` |
| `CORS_ORIGIN` | Allowed origins for CORS policy | `http://localhost:5173,https://vercel-app.app` |
| `NODE_ENV` | Deployment environment | `development` or `production` |
| `SMTP_HOST` | Email service hostname | `smtp.gmail.com` |
| `SMTP_PORT` | Email service port | `465` |
| `SMTP_SECURE` | Use TLS for SMTP | `true` |
| `SMTP_USER` | Email service username | `your-email@gmail.com` |
| `SMTP_PASS` | Email service password/app-password | Application-specific password |
| `MAIL_FROM` | Sender email address | `Amazon Clone <noreply@example.com>` |

See `server/.env.example` for template.

### Frontend Environment Variables (.env)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` (dev) or `https://api.example.com/api` (prod) |

See `client/.env.example` for template.

## 12. Cloud Deployment Guide

### Automated Deployment Blueprint

The project includes `render.yaml` which defines both services for one-command deployment to Render.

### Backend Deployment (Render Web Service)

**Configuration:**

| Setting | Value | Notes |
|---|---|---|
| Service Type | Web Service | Managed Node.js runtime |
| Root Directory | `server` | Render uses this as project root |
| Environment | Node | Runtime version auto-detected from package.json |
| Build Command | `npm install --include=dev && npx prisma@5.22.0 generate` | Installs dependencies and generates Prisma client |
| Start Command | `npm start` | Runs production server |
| Port | Auto-detected (5000) | Set via PORT env var |

**Required Environment Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `DIRECT_URL` - Direct database connection (for Prisma migrations)
- `CORS_ORIGIN` - Allowed frontend URL (e.g., https://your-vercel-app.vercel.app)
- `NODE_ENV` - Set to `production`

**Optional Environment Variables:**
- All SMTP_* variables for email functionality

**Deployment Steps:**
1. Connect GitHub repository to Render
2. Create new Web Service pointing to your repo
3. Configure environment variables
4. Deploy (Render auto-detects render.yaml and applies settings)

### Frontend Deployment (Vercel)

**Configuration:**

| Setting | Value | Notes |
|---|---|---|
| Framework | React (Vite) | Auto-detected by Vercel |
| Project Root | `client` | Vercel uses this as build root |
| Build Command | `npm run build` | Vite builds to dist/ |
| Output Directory | `dist` | Where build artifacts are placed |

**Required Environment Variables:**
- `VITE_API_URL` - Backend API URL with /api suffix (e.g., https://your-render-app.onrender.com/api)

**Deployment Steps:**
1. Connect GitHub repository to Vercel
2. Select Framework: "Other" (for Vite)
3. Set Root Directory: `client`
4. Add `VITE_API_URL` environment variable
5. Deploy (Vercel watches for pushes to main branch)

### Verifying Deployment

After deployment completes:

1. **Frontend Health Check:** Visit the Vercel URL, confirm products load
2. **Backend Health Check:** Visit `{RENDER_URL}/api` (should respond with Express routing info)
3. **API Connectivity:** Use browser DevTools Network tab to verify API calls succeed
4. **Email Functionality:** Place a test order, confirm email arrives in inbox

## 13. Project Assumptions & Design Notes

### Authentication Model

- **No login required** per assignment specification
- Default seeded user (ID=1) used for all transactions
- Cart and wishlist persisted to this user automatically
- In production, integrate with auth provider (OAuth, JWT, etc.) as needed

### Simplification Decisions

- **Redis Removed:** Stateless API design eliminates cache layer complexity; database queries are sufficiently fast for small-to-medium scale
- **Payment Integration:** Placeholder payment method; production should integrate Stripe/PayPal
- **Image CDN:** Product images served from database URLs; production should use CloudFront or similar CDN

### Production Readiness

- Email notifications are fully production-ready with branded templates
- CORS properly configured for production URLs
- Rate limiting enabled to prevent API abuse
- Error handling implemented with descriptive messages
- Database transactions ensure order integrity

## 14. Documentation & Additional Resources

| Document | Purpose | Location |
|---|---|---|
| Frontend Guide | React component structure, setup, deployment | [client/README.md](client/README.md) |
| Backend Guide | API endpoints, database schema, deployment | [server/README.md](server/README.md) |
| Project Report | Formal assignment submission report with diagrams | [docs/REPORT.md](docs/REPORT.md) |
| Screenshots | Application UI screenshots and capture checklist | [docs/screenshots/README.md](docs/screenshots/README.md) |
| Deployment Blueprint | One-command deployment configuration | [render.yaml](render.yaml) |
