const pool = require('./config/database');

const API_URL = 'http://localhost:5000/api';

async function testOrderFlow() {
    try {
        console.log('Starting Order Flow Test...');

        // 1. Get products to find an ID
        const prodRes = await pool.query('SELECT id FROM products LIMIT 1');
        if (prodRes.rows.length === 0) throw new Error('No products found');
        const productId = prodRes.rows[0].id;
        console.log('Found product ID:', productId);

        // 2. Add to cart
        console.log('Adding to cart...');
        const cartRes = await fetch(`${API_URL}/cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, quantity: 1 })
        });

        if (!cartRes.ok) {
            throw new Error(`Add to Cart failed: ${cartRes.status} ${await cartRes.text()}`);
        }
        console.log('Item added to cart.');

        // 3. Place order
        console.log('Placing order...');
        const shippingAddress = {
            fullName: 'Test User',
            address: '123 Test St',
            city: 'Test City',
            state: 'TS',
            zipCode: '12345',
            country: 'Test Country',
            phone: '1234567890'
        };

        const orderRes = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ shippingAddress })
        });

        if (!orderRes.ok) {
            throw new Error(`Place Order failed: ${orderRes.status} ${await orderRes.text()}`);
        }

        const orderData = await orderRes.json();
        console.log('Order placed successfully. Order ID:', orderData.order.id);

    } catch (error) {
        console.error('Test Failed:', error.message);
        process.exit(1);
    } finally {
        pool.end();
    }
}

testOrderFlow();
