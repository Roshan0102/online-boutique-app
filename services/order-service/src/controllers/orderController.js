const db = require('../db');

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:5002';

// Create a new order
exports.createOrder = async (req, res) => {
  const { items } = req.body; // Expects array: [ { product_id: 1, quantity: 2 }, ... ]
  const userId = req.user.id;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order itemss are required and must be an array.' });
  }

  // Validate database connection client for transaction
  let client;

  try {
    const verifiedItems = [];
    let totalPrice = 0;

    // 1. Verify products and prices via Product Service (service-to-service communication)
    for (const item of items) {
      if (!item.product_id || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({ error: 'Each item must have a valid product_id and a positive quantity.' });
      }

      try {
        console.log(`[Order Service] Verifying product ${item.product_id} with Product Service...`);
        const productResponse = await fetch(`${PRODUCT_SERVICE_URL}/api/products/${item.product_id}`);

        if (productResponse.status !== 200) {
          return res.status(400).json({
            error: `Product with ID ${item.product_id} could not be verified. It might not exist.`
          });
        }

        const product = await productResponse.json();
        const price = parseFloat(product.price);
        const itemTotal = price * item.quantity;
        totalPrice += itemTotal;

        verifiedItems.push({
          product_id: item.product_id,
          name: product.name,
          quantity: item.quantity,
          price: price
        });
      } catch (err) {
        console.error(`Error connecting to Product Service:`, err.message);
        return res.status(503).json({
          error: 'Product verification failed. Product Service is temporarily unavailable.'
        });
      }
    }

    // 2. Perform database transaction to insert Order & Order Items
    client = await db.pool.connect();
    await client.query('BEGIN');

    // Insert order record
    const insertOrderQuery = `
      INSERT INTO orders (user_id, total_price, status)
      VALUES ($1, $2, 'Pending')
      RETURNING id, user_id, total_price, status, created_at
    `;
    const orderResult = await client.query(insertOrderQuery, [userId, totalPrice]);
    const newOrder = orderResult.rows[0];

    // Insert order items
    const insertItemQuery = `
      INSERT INTO order_items (order_id, product_id, quantity, price)
      VALUES ($1, $2, $3, $4)
    `;

    for (const verifiedItem of verifiedItems) {
      await client.query(insertItemQuery, [
        newOrder.id,
        verifiedItem.product_id,
        verifiedItem.quantity,
        verifiedItem.price
      ]);
    }

    await client.query('COMMIT');
    console.log(`[Order Service] Order created successfully: ID ${newOrder.id} for User ${userId}`);

    return res.status(201).json({
      message: 'Order placed successfully',
      order: {
        ...newOrder,
        items: verifiedItems
      }
    });

  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error('Order Creation Error:', error);
    return res.status(500).json({ error: 'Internal server error placing order.' });
  } finally {
    if (client) {
      client.release();
    }
  }
};

// Get order history for authenticated user
exports.getUserOrders = async (req, res) => {
  const userId = req.user.id;

  try {
    // Get all orders for this user
    const ordersQuery = 'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC';
    const ordersResult = await db.query(ordersQuery, [userId]);
    const orders = ordersResult.rows;

    if (orders.length === 0) {
      return res.status(200).json([]);
    }

    // Get all order items for these orders
    const orderIds = orders.map(o => o.id);
    const itemsQuery = 'SELECT * FROM order_items WHERE order_id = ANY($1)';
    const itemsResult = await db.query(itemsQuery, [orderIds]);
    const allItems = itemsResult.rows;

    // Fetch product list from Product Service to resolve product names
    const productMap = {};
    try {
      const productsResponse = await fetch(`${PRODUCT_SERVICE_URL}/api/products`);
      if (productsResponse.status === 200) {
        const products = await productsResponse.json();
        products.forEach(p => {
          productMap[p.id] = p.name;
        });
      }
    } catch (err) {
      console.error('[Order Service] Could not fetch products for order name enrichment:', err.message);
    }

    // Group items by order and attach resolved names
    const ordersWithItems = orders.map(order => {
      const itemsForOrder = allItems
        .filter(item => item.order_id === order.id)
        .map(item => ({
          ...item,
          product_name: productMap[item.product_id] || `Product #${item.product_id}`
        }));

      return {
        ...order,
        items: itemsForOrder
      };
    });

    return res.status(200).json(ordersWithItems);
  } catch (error) {
    console.error('Fetch Orders Error:', error);
    return res.status(500).json({ error: 'Internal server error fetching orders.' });
  }
};

// Get details for a specific order
exports.getOrderDetails = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Fetch the order
    const orderQuery = 'SELECT * FROM orders WHERE id = $1';
    const orderResult = await db.query(orderQuery, [id]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const order = orderResult.rows[0];

    // Security check: Only the user who placed the order (or an admin) can view it
    if (order.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied. You do not own this order.' });
    }

    // Fetch order items
    const itemsQuery = 'SELECT * FROM order_items WHERE order_id = $1';
    const itemsResult = await db.query(itemsQuery, [id]);

    // Attempt to enrich with product details from product-service
    const enrichedItems = [];
    for (const item of itemsResult.rows) {
      try {
        const productResponse = await fetch(`${PRODUCT_SERVICE_URL}/api/products/${item.product_id}`);
        if (productResponse.status === 200) {
          const product = await productResponse.json();
          enrichedItems.push({
            ...item,
            product_name: product.name,
            image_url: product.image_url
          });
        } else {
          enrichedItems.push({ ...item, product_name: `Product #${item.product_id}` });
        }
      } catch (err) {
        // Fallback if product service is offline
        enrichedItems.push({ ...item, product_name: `Product #${item.product_id}` });
      }
    }

    return res.status(200).json({
      ...order,
      items: enrichedItems
    });
  } catch (error) {
    console.error('Fetch Order Details Error:', error);
    return res.status(500).json({ error: 'Internal server error fetching order details.' });
  }
};
