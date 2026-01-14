const pool = require('./config/database');

const products = [
  // Electronics
  {
    name: "Sony WH-1000XM5 Wireless Noise Canceling Headphones",
    description: "Industry-leading noise cancellation optimized for you. 30-hour battery life with quick charging.",
    price: 348.00,
    category: "Electronics",
    images: ["https://images.unsplash.com/photo-1641048930621-ab5d225ae5b0?q=80&w=2000"],
    stock_quantity: 50,
    rating: 4.8,
    num_reviews: 120,
    brand: "Sony"
  },
  {
    name: "Apple MacBook Air 15-inch Laptop - M2 Chip",
    description: "Strikingly thin design. Supercharged by M2. Up to 18 hours of battery life.",
    price: 1299.00,
    category: "Electronics",
    images: ["https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=2000"],
    stock_quantity: 30,
    rating: 4.9,
    num_reviews: 85,
    brand: "Apple"
  },
  {
    name: "Samsung Galaxy S23 Ultra 5G",
    description: "Capture the night with Low Lightography. The fastest Snapdragon processor yet.",
    price: 1199.99,
    category: "Electronics",
    images: ["https://images.unsplash.com/photo-1721864429261-3059e48c056b?q=80&w=2000"],
    stock_quantity: 45,
    rating: 4.7,
    num_reviews: 92,
    brand: "Samsung"
  },
  {
    name: "Logitech MX Master 3S Wireless Mouse",
    description: "Performance wireless mouse, Ergo design, 8K DPI tracking, Quiet Clicks.",
    price: 99.99,
    category: "Electronics",
    images: ["https://images.unsplash.com/photo-1722682810969-06dfc9c9d517?q=80&w=2000"],
    stock_quantity: 100,
    rating: 4.8,
    num_reviews: 1500,
    brand: "Logitech"
  },
  {
    name: "Amazon Echo Dot (5th Gen)",
    description: "The best sounding Echo Dot yet. Enjoy an improved audio experience.",
    price: 49.99,
    category: "Electronics",
    images: ["https://images.unsplash.com/photo-1519558260268-cde7e03a0152?q=80&w=2000"],
    stock_quantity: 200,
    rating: 4.6,
    num_reviews: 5000,
    brand: "Amazon"
  },

  // Home & Kitchen
  {
    name: "Nespresso Vertuo Coffee Machine",
    description: "Versatile coffee maker. Brews 4 different cup sizes at the touch of a button.",
    price: 159.00,
    category: "Home & Kitchen",
    images: ["https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=500&auto=format&fit=crop&q=60"],
    stock_quantity: 60,
    rating: 4.6,
    num_reviews: 210,
    brand: "Nespresso"
  },
  {
    name: "Instant Pot Duo 7-in-1",
    description: "Electric Pressure Cooker, Slow Cooker, Rice Cooker, Steamer, Sauté, Yogurt Maker, and Warmer.",
    price: 89.99,
    category: "Home & Kitchen",
    images: ["https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?q=80&w=2000"],
    stock_quantity: 75,
    rating: 4.8,
    num_reviews: 500,
    brand: "Instant Pot"
  },
  {
    name: "Dyson V15 Detect Cordless Vacuum",
    description: "Dyson's most powerful, intelligent cordless vacuum. Laser reveals microscopic dust.",
    price: 749.99,
    category: "Home & Kitchen",
    images: ["https://images.unsplash.com/photo-1765970101654-337b573142fb?q=80&w=2000"],
    stock_quantity: 20,
    rating: 4.7,
    num_reviews: 300,
    brand: "Dyson"
  },
  {
    name: "KitchenAid Artisan Series 5-Qt. Stand Mixer",
    description: "Features 10 speeds to thoroughly mix, knead and whip ingredients.",
    price: 449.00,
    category: "Home & Kitchen",
    images: ["https://images.unsplash.com/photo-1594385208974-2e75f8d7bb48?w=500&auto=format&fit=crop&q=60"],
    stock_quantity: 15,
    rating: 4.9,
    num_reviews: 1200,
    brand: "KitchenAid"
  },

  // Clothing & Fashion
  {
    name: "Levi's Men's 501 Original Fit Jeans",
    description: "The original blue jean since 1873. Straight leg with button fly.",
    price: 69.50,
    category: "Clothing",
    images: ["https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=500&auto=format&fit=crop&q=60"],
    stock_quantity: 100,
    rating: 4.5,
    num_reviews: 350,
    brand: "Levi's"
  },
  {
    name: "Adidas Men's Ultraboost Light Running Shoes",
    description: "Lightweight running shoes with energy-returning BOOST cushioning.",
    price: 180.00,
    category: "Clothing",
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60"],
    stock_quantity: 60,
    rating: 4.7,
    num_reviews: 200,
    brand: "Adidas"
  },
  {
    name: "Ray-Ban Aviator Classic Sunglasses",
    description: "Timeless style suitable for any occasion. 100% UV protection.",
    price: 163.00,
    category: "Clothing",
    images: ["https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&auto=format&fit=crop&q=60"],
    stock_quantity: 40,
    rating: 4.6,
    num_reviews: 800,
    brand: "Ray-Ban"
  },

  // Books
  {
    name: "Atomic Habits by James Clear",
    description: "An Easy & Proven Way to Build Good Habits & Break Bad Ones.",
    price: 13.99,
    category: "Books",
    images: ["https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg"],
    stock_quantity: 200,
    rating: 4.9,
    num_reviews: 50000,
    brand: "Penguin"
  },
  {
    name: "The Psychology of Money",
    description: "Timeless lessons on wealth, greed, and happiness doing well with money.",
    price: 15.60,
    category: "Books",
    images: ["https://covers.openlibrary.org/b/isbn/9780857197689-L.jpg"],
    stock_quantity: 150,
    rating: 4.8,
    num_reviews: 30000,
    brand: "Morgan Housel"
  },
  {
    name: "Rich Dad Poor Dad",
    description: "What the Rich Teach Their Kids About Money That the Poor and Middle Class Do Not!",
    price: 14.50,
    category: "Books",
    images: ["https://m.media-amazon.com/images/I/71yNgTMEcpL._AC_SL1500_.jpg"],
    stock_quantity: 180,
    rating: 4.8,
    num_reviews: 45000,
    brand: "Robert T. Kiyosaki"
  }
];

const seedData = async () => {
  try {
    console.log('Seeding database...');

    // Clear existing products and users
    await pool.query('DELETE FROM cart');
    await pool.query('DELETE FROM wishlist');
    await pool.query('DELETE FROM orders');
    await pool.query('DELETE FROM products');
    await pool.query('DELETE FROM users');
    console.log('Cleared existing data');

    // Create default user (for demo purposes)
    const hashedPassword = '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1'; // Invalid hash but placeholder
    await pool.query(
      'INSERT INTO users (id, name, email, password) VALUES ($1, $2, $3, $4)',
      [1, 'Demo User', 'demo@example.com', hashedPassword]
    );
    // Reset sequence to skip 1
    await pool.query("SELECT setval('users_id_seq', 1, true)");
    console.log('Created demo user (ID: 1)');

    // Insert new products
    for (const product of products) {
      await pool.query(
        `INSERT INTO products (
          name, description, price, category, images, 
          stock_quantity, rating, num_reviews, brand
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          product.name,
          product.description,
          product.price,
          product.category,
          product.images,
          product.stock_quantity,
          product.rating,
          product.num_reviews,
          product.brand
        ]
      );
    }

    console.log('Data imported successfully');
    process.exit();
  } catch (error) {
    console.error('Error with data import', error);
    process.exit(1);
  }
};

seedData();
