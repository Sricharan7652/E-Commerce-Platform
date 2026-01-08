const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

// Get user's wishlist
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT w.*, p.* 
       FROM wishlist w 
       JOIN products p ON w.product_id = p.id 
       WHERE w.user_id = $1 
       ORDER BY w.created_at DESC`,
      [userId]
    );

    res.json({ wishlist: result.rows });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add product to wishlist
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Please provide productId' });
    }

    // Check if already in wishlist
    const existing = await pool.query(
      'SELECT * FROM wishlist WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    await pool.query(
      'INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2)',
      [userId, productId]
    );

    res.json({ message: 'Product added to wishlist' });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove product from wishlist
router.delete('/:productId', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    await pool.query(
      'DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );

    res.json({ message: 'Product removed from wishlist' });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
