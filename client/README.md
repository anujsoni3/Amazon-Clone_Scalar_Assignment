# Client Application

## Overview

React frontend for the Amazon Clone assignment.

## Responsibilities

- Amazon-like navigation, cards, and page layouts
- Product listing and detail experience
- Cart, checkout, wishlist, and account pages
- Order history views
- API integration via Axios

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Environment

Create client/.env:

```bash
VITE_API_URL=http://localhost:5000/api
```

For Render:

```bash
VITE_API_URL=https://your-api-name.onrender.com/api
```

## Deployment (Render Static Site)

- Root Directory: client
- Build Command: npm install && npm run build
- Publish Directory: dist
- Env Var: VITE_API_URL
