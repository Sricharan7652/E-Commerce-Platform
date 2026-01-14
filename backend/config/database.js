const { Pool } = require('pg');
const url = require('url');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';
const connectionString = process.env.DATABASE_URL;

// Parse and Log connection details for debugging
if (connectionString) {
  try {
    const params = new url.URL(connectionString);
    console.log(`✅ Using DATABASE_URL. Host: ${params.hostname}, Port: ${params.port}, DB: ${params.pathname}`);
  } catch (e) {
    console.error('❌ DATABASE_URL is provided but invalid URL format:', e.message);
  }
} else {
  console.log('⚠️  DATABASE_URL not found, falling back to localhost default');
}

const poolConfig = {
  connectionString: connectionString || 'postgresql://postgres:postgres@localhost:5432/amazon_clone',
  ssl: isProduction ? { rejectUnauthorized: false } : false
};

console.log('🔌 Pool Config SSL:', poolConfig.ssl);
console.log('🔌 Pool Config URL provided:', !!poolConfig.connectionString);

const pool = new Pool(poolConfig);

// Test the connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection error:', err);
    // Print more details if available
    if (err.address) console.error('   Attempted address:', err.address);
    if (err.port) console.error('   Attempted port:', err.port);
  } else {
    console.log('✅ Database connected successfully');
  }
});

module.exports = pool;
