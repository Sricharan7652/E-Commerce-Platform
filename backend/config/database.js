const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';
const connectionString = process.env.DATABASE_URL;

// Log connection source for debugging
if (connectionString) {
  console.log('✅ Using DATABASE_URL from environment');
} else {
  console.log('⚠️  DATABASE_URL not found, using localhost default');
}

const poolConfig = {
  connectionString: connectionString || 'postgresql://postgres:postgres@localhost:5432/amazon_clone',
  // Render (and most cloud providers) require SSL for production databases
  ssl: isProduction ? { rejectUnauthorized: false } : false
};

const pool = new Pool(poolConfig);

// Test the connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection error:', err);
  } else {
    console.log('✅ Database connected successfully');
  }
});

module.exports = pool;
