const express = require('express');
const cors = require('cors');
require('dotenv').config();
// Database connection is handled by the pool in config/database.js
const pool = require('./config/database');

const app = express();

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL, // Allow the deployed frontend URL
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173' // Vite default port
  ].filter(Boolean), // Remove undefined/falsy values if env var is missing
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/wishlist', require('./routes/wishlist'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
