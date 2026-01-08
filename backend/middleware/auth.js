const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      // For demo purposes, use default user ID if no token
      req.user = { id: 1 };
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [decoded.id]);
    
    if (result.rows.length === 0) {
      req.user = { id: 1 };
      return next();
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    // For demo purposes, use default user ID on error
    req.user = { id: 1 };
    next();
  }
};

module.exports = auth;
