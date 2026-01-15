const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

// Get user's orders
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.json({ orders: result.rows });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single order
router.get('/:id', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ order: result.rows[0] });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Place new order
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { shippingAddress } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({ message: 'Please provide shipping address' });
    }

    // Get cart items
    const cartResult = await pool.query(
      `SELECT c.*, p.name, p.price, p.images 
       FROM cart c 
       JOIN products p ON c.product_id = p.id 
       WHERE c.user_id = $1`,
      [userId]
    );

    if (cartResult.rows.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate prices
    const itemsPrice = cartResult.rows.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.quantity,
      0
    );
    const shippingPrice = itemsPrice > 100 ? 0 : 10;
    const taxPrice = itemsPrice * 0.1;
    const totalPrice = itemsPrice + taxPrice + shippingPrice;

    // Prepare order items
    const orderItems = cartResult.rows.map(item => ({
      product: item.product_id,
      name: item.name,
      image: item.images[0] || '',
      quantity: item.quantity,
      price: parseFloat(item.price),
    }));

    // Create order
    const orderResult = await pool.query(
      `INSERT INTO orders (user_id, order_items, shipping_address, items_price, tax_price, shipping_price, total_price)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        userId,
        JSON.stringify(orderItems),
        JSON.stringify(shippingAddress),
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      ]
    );

    // Clear cart
    await pool.query('DELETE FROM cart WHERE user_id = $1', [userId]);

    // Send confirmation email
    try {
      // Get user email
      const userResult = await pool.query('SELECT email, name FROM users WHERE id = $1', [userId]);
      const user = userResult.rows[0];

      if (user && user.email) {
        const message = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #131921;">Order Confirmation</h1>
            <p>Hello ${user.name},</p>
            <p>Thank you for shopping with us. We've received your order.</p>
            
            <div style="background-color: #f0f2f2; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; font-weight: bold;">Order #${orderResult.rows[0].id}</p>
              <p style="margin: 5px 0;">Total: $${parseFloat(totalPrice).toFixed(2)}</p>
            </div>

            <h3>Order Details:</h3>
            <ul>
              ${orderItems.map(item => `
                <li>
                  ${item.quantity}x ${item.name} - $${item.price.toFixed(2)}
                </li>
              `).join('')}
            </ul>

            <p style="margin-top: 20px; color: #565959;">
              We'll send a confirmation when your items ship.
            </p>
          </div>
        `;

        const sendEmail = require('../utils/email');
        // Don't await email - fire and forget to prevent blocking the response
        sendEmail({
          email: user.email,
          subject: `Your Amazon Clone Order #${orderResult.rows[0].id}`,
          message
        }).catch(err => console.error('Background email failed:', err));
      }
    } catch (error) {
      // Log error but don't fail the request
      console.error('Email setup error:', error);
    }

    res.status(201).json({
      message: 'Order placed successfully',
      order: orderResult.rows[0],
    });
  } catch (error) {
    console.error('Place order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
