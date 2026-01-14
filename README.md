# Amazon Clone E-Commerce Platform

A full-stack e-commerce application built to replicate the core functionality and design of Amazon.

## Tech Stack

- **Frontend:** Next.js 15 (React), Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Email:** Nodemailer (configured for Ethereal/SMTP)
- **Deployment:** (Instructions for local dev provided below)

## Features

- **User Interface:** Responsive Amazon-like design (Header, Footer, Product Cards)
- **Product Listing:** Filter by category, search functionality.
- **Product Details:** Image gallery, detailed description, buy box.
- **Shopping Cart:** Add/remove items, update quantities, subtotal calculation.
- **Checkout:** Shipping address form, order summary.
- **Order Management:**
  - Order Placement with database persistence.
  - Order History ("Your Orders") with status tracking.
  - Order Confirmation with Email Notification.
- **Micro-interactions:** Hover effects, toast notifications.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL (running locally or via Docker)

### 1. Database Setup
Ensure PostgreSQL is running. Create a database (e.g., `amazon_clone`) and run the schema migration.
The schema expects tables: `users`, `products`, `orders`, `cart`.
(See `backend/schema.sql` if available, or rely on existing setup).

### 2. Backend Setup
```bash
cd backend
npm install
# Configure .env file with DB credentials and SMTP settings
# SMTP_HOST=smtp.ethereal.email
# SMTP_PORT=587
# SMTP_USER=...
# SMTP_PASS=...
npm run dev
```
Backend runs on `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:3000`.

## Assumptions & Notes
- **Authentication:** Default user (ID: 1) is assumed for this demo. Login page exists but `localStorage`/backend session handling is simplified for the clone.
- **Data:** Initial products are seeded in the database.
- **Images:** External images (Amazon hosted) are used with `referrerPolicy="no-referrer"` to avoid broken links.
