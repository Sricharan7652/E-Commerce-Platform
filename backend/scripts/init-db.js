const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function initDB() {
    try {
        // Read schema file
        const schemaPath = path.join(__dirname, '..', 'models', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('Running schema initialization...');

        // Split into individual statements if needed, or run as one block
        await pool.query(schema);

        console.log('Database schema initialized successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

initDB();
