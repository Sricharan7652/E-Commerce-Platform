const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

const sampleProducts = [
  {
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium noise-cancelling wireless headphones with 30-hour battery life and superior sound quality.',
    price: 199.99,
    category: 'Electronics',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'],
    stock_quantity: 50,
    rating: 4.5,
    numReviews: 128,
    brand: 'AudioTech'
  },
  {
    name: 'Smart Watch Pro',
    description: 'Advanced fitness tracking, heart rate monitoring, and smartphone integration in a sleek design.',
    price: 299.99,
    category: 'Electronics',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'],
    stock_quantity: 75,
    rating: 4.3,
    numReviews: 89,
    brand: 'TechWatch'
  },
  {
    name: 'Organic Cotton T-Shirt',
    description: 'Comfortable and sustainable organic cotton t-shirt, perfect for everyday wear.',
    price: 29.99,
    category: 'Clothing',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&auto=format&fit=crop&q=80'],
    stock_quantity: 200,
    rating: 4.2,
    numReviews: 45,
    brand: 'EcoWear'
  },
  {
    name: 'Stainless Steel Water Bottle',
    description: 'Insulated double-wall construction keeps drinks cold for 24 hours or hot for 12 hours.',
    price: 24.99,
    category: 'Home & Kitchen',
    images: ['https://images.unsplash.com/photo-1602140860282-46b5d22d1c1c?w=600&auto=format&fit=crop&q=80'],
    stock_quantity: 150,
    rating: 4.6,
    numReviews: 203,
    brand: 'HydroMax'
  },
  {
    name: 'Yoga Mat Premium',
    description: 'Extra thick, non-slip yoga mat with alignment markers for perfect poses.',
    price: 49.99,
    category: 'Home & Kitchen',
    images: ['https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&auto=format&fit=crop&q=80'],
    stock_quantity: 80,
    rating: 4.4,
    numReviews: 67,
    brand: 'ZenFit'
  },
  {
    name: 'Denim Jacket Classic',
    description: 'Timeless denim jacket with modern fit and sustainable manufacturing.',
    price: 89.99,
    category: 'Clothing',
    images: ['https://images.unsplash.com/photo-1571697356505-257f09b69d2b?w=600&auto=format&fit=crop&q=80'],
    stock_quantity: 120,
    rating: 4.1,
    numReviews: 156,
    brand: 'DenimCo'
  }
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');
    
    // Insert sample products
    await Product.insertMany(sampleProducts);
    console.log('Database seeded successfully!');
    console.log(`Inserted ${sampleProducts.length} products`);
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase();
