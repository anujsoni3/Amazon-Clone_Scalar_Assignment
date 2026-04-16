# Amazon Clone Platform

This is a full-stack e-commerce web application designed to visually replicate Amazon's core storefront with high precision. It handles the complete ordering flow—from product viewing to cart manipulation to checkout procedures—built entirely around modern conventions for a scalable backend and single-page frontend.

Built for the **Scalar SDE Intern Fullstack Assignment**.

## Tech Stack Overview

- **Frontend:** React.js (via Vite)
- **State Management:** React Context API (Cart Provider globally handling quantities/syncing)
- **Styling:** Custom CSS implementing exact Amazon UI Color Palettes (no generic component libraries used to guarantee visual authenticity).
- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL (Neon Serverless PostgreSQL)
- **ORM:** Prisma

## Implementation Features

### 1. Product Listing & Filtering
Implemented a dynamic responsive grid loaded with seeded PostgreSQL data. Includes functional sidebar categories (Electronics, Clothing, etc.), sorting functions (Price High/Low, Rated), and search. Includes Amazon's standard truncated titles and immediate "Add to Cart" functionality directly from cards.

### 2. Product Detail Page
A highly authentic 3-column layout matching Amazon. Features thumbnail gallery swapping on hover, rich product descriptions, and a strictly defined "Buy Box" pane that disables buttons if an item stock equals zero.

### 3. Smart Shopping Cart
Centralized tracking that dynamically handles Quantity mutations. Instantly updates the Navbar tracker without page-refresh overhead. It includes live subtotal calculations based on Free Shipping triggers (> ₹499 carts).

### 4. Checkout & Order Generation
A multi-step checkout form grabbing user delivery credentials. Processes into the database generating a UUID for the order, and creates snapshots of product prices at the exact time of purchase to ensure historical integrity within the Relational Database.

## Core Database Schema Choices

The database is normalized across **9 core tables/models**:
- `users`: Simulates the authentication (Defaulted to `Anuj Soni`).
- `categories`: Contains slugs to categorize items.
- `products`: Links to `categories`. Holds current price, ratings, descriptions and stock status.
- `product_images`: 1-to-many relationship with products for gallery views.
- `cart_items`: Holds active user carts.
- `orders`: Stores the shipping address as JSON and global subtotal/status. Primary Key using UUIDs to prevent enumeration.
- `order_items`: The critical relational mapping. Stores a **snapshot** of the product price so past orders aren't retroactively changed if a product is put on sale later.
- `wishlists`: Stores products saved for later by user.
- `reviews`: Stores product ratings/reviews and verified purchase metadata.

## Setup Instructions

### Prerequisites
- Node.js `v20+`
- A PostgreSQL Database (The local environment is currently pointing to a cloud-hosted Neon database)

### Starting the Backend
1. Open a terminal and navigate to the server root:
   ```bash
   cd server
   ```
2. Install dependencies and start the server:
   ```bash
   npm install
   node src/app.js
   ```
   *The server runs on `localhost:5000` by default. It must be running for the frontend to receive product seeds.*

### Starting the Frontend
1. Open a new, separate terminal and navigate to the client root:
   ```bash
   cd client
   ```
2. Install dependencies and start the Vite frontend:
   ```bash
   npm install
   npm run dev
   ```
3. Open your browser to the local URL provided by Vite (e.g. `http://localhost:5173`).

## Notes & Assumptions

- Authentication is intentionally simplified to a seeded default user for assignment scope.
- Email notifications are not implemented (bonus feature).
- For local development, run backend and frontend separately as documented above.
