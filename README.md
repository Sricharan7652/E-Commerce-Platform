# Amazon Clone - E-Commerce Platform

A full-stack e-commerce web application that closely replicates Amazon's design and user experience. Built with Next.js frontend using dummy data and localStorage for a standalone, fully functional experience. Backend also included (optional).

## Features

### Core Features (Must Have)
- **Product Listing Page**: Grid layout with search and category filtering
- **Product Detail Page**: Image carousel, description, specifications, and buy options
- **Shopping Cart**: Add, update quantity, and remove items
- **Order Placement**: Checkout with shipping address and order confirmation

### Bonus Features (Good to Have)
- **Responsive Design**: Mobile, tablet, and desktop support
- **User Authentication**: Login and Signup functionality
- **Order History**: View past orders with details
- **Wishlist**: Save favorite products for later
- **Email Notifications**: Order confirmation emails (configure email in .env)

## Tech Stack

### Frontend
- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Dummy Data** - All products loaded from dummy data (no API calls needed)
- **localStorage** - Cart, orders, wishlist, and authentication stored locally

### Backend (Optional)
- **Node.js**
- **Express.js**
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Nodemailer** for email notifications
- **bcryptjs** for password hashing

## Project Structure

```
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── models/
│   │   ├── User.js               # User model
│   │   ├── Product.js            # Product model
│   │   ├── Cart.js               # Cart model
│   │   ├── Order.js              # Order model
│   │   └── Wishlist.js           # Wishlist model
│   ├── routes/
│   │   ├── auth.js               # Authentication routes
│   │   ├── products.js           # Product routes
│   │   ├── cart.js               # Cart routes
│   │   ├── orders.js             # Order routes
│   │   └── wishlist.js           # Wishlist routes
│   ├── middleware/
│   │   └── auth.js               # Authentication middleware
│   ├── utils/
│   │   └── sendEmail.js          # Email utility
│   ├── server.js                 # Express server
│   ├── seed.js                   # Database seeder
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── page.tsx              # Home/Product listing
│   │   ├── login/
│   │   │   └── page.tsx          # Login/Signup
│   │   ├── product/
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Product detail
│   │   ├── cart/
│   │   │   └── page.tsx          # Shopping cart
│   │   ├── checkout/
│   │   │   └── page.tsx          # Checkout
│   │   ├── order-confirmation/
│   │   │   └── page.tsx          # Order confirmation
│   │   ├── orders/
│   │   │   └── page.tsx          # Order history
│   │   └── wishlist/
│   │       └── page.tsx          # Wishlist
│   ├── components/
│   │   ├── Header.tsx            # Navigation header
│   │   └── ProductCard.tsx       # Product card component
│   ├── lib/
│   │   └── api.ts                # API client
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Frontend Setup (Standalone - Works Without Backend)

**The frontend works completely standalone using dummy data and localStorage. No backend is required!**

1. **Navigate to frontend directory**
   ```bash
   cd frontend/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:3000`

   **That's it!** The app works with:
   - 12 dummy products across 3 categories
   - localStorage for cart, orders, wishlist, and user authentication
   - No API calls or backend needed

### Backend Setup (Optional)

If you want to use the backend API instead of dummy data:

1. **Navigate to backend directory**
   ```bash
   cd backend/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/amazon-clone
   JWT_SECRET=your-secret-key-change-in-production
   JWT_EXPIRE=7d
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   FRONTEND_URL=http://localhost:3000
   ```

4. **Seed the database** with sample products
   ```bash
   npm run seed
   ```

5. **Start the backend server**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

   The backend will run on `http://localhost:5000`

   **Note**: The frontend is currently configured to use dummy data and localStorage. To use the backend API, you would need to update the frontend code to make API calls instead of using dummy data.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products (with optional `?search=term&category=Category`)
- `GET /api/products/:id` - Get single product
- `GET /api/products/categories/list` - Get all categories

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:itemId` - Update cart item quantity
- `DELETE /api/cart/:itemId` - Remove item from cart
- `DELETE /api/cart` - Clear entire cart

### Orders
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Place new order

### Wishlist
- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist` - Add product to wishlist
- `DELETE /api/wishlist/:productId` - Remove product from wishlist

## Database Schema

### User
- `name`: String
- `email`: String (unique)
- `password`: String (hashed)
- `createdAt`: Date

### Product
- `name`: String
- `description`: String
- `price`: Number
- `category`: String
- `images`: [String]
- `stock_quantity`: Number
- `rating`: Number
- `numReviews`: Number
- `brand`: String
- `specifications`: Map
- `createdAt`: Date

### Cart
- `user`: ObjectId (ref: User)
- `items`: [{
    `product`: ObjectId (ref: Product),
    `quantity`: Number
  }]
- `updatedAt`: Date

### Order
- `user`: ObjectId (ref: User)
- `orderItems`: [{
    `product`: ObjectId (ref: Product),
    `name`: String,
    `image`: String,
    `quantity`: Number,
    `price`: Number
  }]
- `shippingAddress`: Object
- `itemsPrice`: Number
- `taxPrice`: Number
- `shippingPrice`: Number
- `totalPrice`: Number
- `status`: String (Placed, Processing, Shipped, Delivered, Cancelled)
- `createdAt`: Date

### Wishlist
- `user`: ObjectId (ref: User)
- `products`: [ObjectId] (ref: Product)
- `updatedAt`: Date

## Data Storage

### Frontend (Standalone Mode)
- **Products**: 12 dummy products stored in `frontend/frontend/lib/dummyProducts.ts`
- **Cart**: Stored in browser localStorage
- **Orders**: Stored in browser localStorage
- **Wishlist**: Stored in browser localStorage
- **User Authentication**: Stored in browser localStorage (users stored in localStorage)

### Backend Mode (Optional)
- **Database**: MongoDB with Mongoose ODM
- All data stored in MongoDB collections

## Assumptions

1. **Standalone Frontend**: The frontend works independently without any backend API calls
2. **User Authentication**: Users are stored in localStorage (frontend) or MongoDB (backend)
3. **Payment Processing**: Mock payment processing (no real payment integration)
4. **Email Configuration**: Email notifications are optional and won't break the app if not configured
5. **Shipping**: Free shipping for orders over $100, otherwise $10 shipping fee
6. **Tax**: 10% tax applied to all orders

## Usage

1. **Browse Products**: Visit the home page to see all products
2. **Search**: Use the search bar to find products by name
3. **Filter**: Select a category from the dropdown to filter products
4. **View Details**: Click on any product to see full details
5. **Add to Cart**: Click "Add to Cart" on any product
6. **Wishlist**: Click the heart icon to add products to wishlist
7. **Checkout**: Go to cart and proceed to checkout
8. **Place Order**: Fill in shipping address and place order
9. **View Orders**: Check order history in "Returns & Orders"
10. **Authentication**: Sign up or login for personalized experience

## Deployment

### Backend Deployment (Render/Railway/Heroku)
1. Set environment variables in your hosting platform
2. Ensure MongoDB is accessible (use MongoDB Atlas for cloud)
3. Deploy and update `NEXT_PUBLIC_API_URL` in frontend

### Frontend Deployment (Vercel/Netlify)
1. Set `NEXT_PUBLIC_API_URL` to your backend URL
2. Deploy the Next.js application

## Development Notes

### Frontend (Standalone)
- **No API Calls**: All functionality works with dummy data and localStorage
- **Products**: 12 products across Electronics, Clothing, and Home & Kitchen categories
- **Authentication**: User signup/login stored in localStorage
- **Cart Management**: Add, update, remove items - all in localStorage
- **Orders**: Order history stored in localStorage
- **Wishlist**: Save favorite products - stored in localStorage

### UI/UX
- The UI closely matches Amazon's design patterns and color scheme
- Responsive design works on mobile, tablet, and desktop
- Product images are loaded from Unsplash (placeholder images)
- Amazon-style animations and transitions

### Data Persistence
- All data persists in browser localStorage
- Clearing browser data will reset cart, orders, and wishlist
- Users can sign up/login and their data persists in localStorage

## License

This project is created for educational purposes as part of an SDE Intern assignment.

## Author

Built as a full-stack e-commerce platform assignment.
