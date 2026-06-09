const db = require('../db');

// Get all products (with optional category filtering)
exports.getAllProducts = async (req, res) => {
  const { category } = req.query;

  try {
    let queryText = 'SELECT * FROM products ORDER BY id DESC';
    const params = [];

    if (category) {
      queryText = 'SELECT * FROM productss WHERE category = $1 ORDER BY id DESC';
      params.push(category);
    }

    const result = await db.query(queryText, params);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Fetch Products Error:', error);
    return res.status(500).json({ error: 'Internal server error fetching products.' });
  }
};

// Get product details by ID
exports.getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const queryText = 'SELECT * FROM products WHERE id = $1';
    const result = await db.query(queryText, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Fetch Product Details Error:', error);
    return res.status(500).json({ error: 'Internal server error fetching product details.' });
  }
};

// Create a new product
exports.createProduct = async (req, res) => {
  const { name, description, price, category, image_url } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({ error: 'Product name and price are required.' });
  }

  try {
    const queryText = `
      INSERT INTO products (name, description, price, category, image_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await db.query(queryText, [
      name.trim(),
      description ? description.trim() : null,
      price,
      category ? category.trim() : null,
      image_url ? image_url.trim() : null
    ]);

    console.log(`Product created: ${result.rows[0].name} (ID: ${result.rows[0].id})`);
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create Product Error:', error);
    return res.status(500).json({ error: 'Internal server error creating product.' });
  }
};

// Update an existing product
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, image_url } = req.body;

  try {
    // Check if product exists
    const checkQuery = 'SELECT id FROM products WHERE id = $1';
    const checkResult = await db.query(checkQuery, [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const queryText = `
      UPDATE products
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          price = COALESCE($3, price),
          category = COALESCE($4, category),
          image_url = COALESCE($5, image_url)
      WHERE id = $6
      RETURNING *
    `;
    const result = await db.query(queryText, [name, description, price, category, image_url, id]);

    console.log(`Product updated (ID: ${id})`);
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Update Product Error:', error);
    return res.status(500).json({ error: 'Internal server error updating product.' });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const deleteQuery = 'DELETE FROM products WHERE id = $1 RETURNING id';
    const result = await db.query(deleteQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    console.log(`Product deleted (ID: ${id})`);
    return res.status(200).json({ message: 'Product deleted successfully', id });
  } catch (error) {
    console.error('Delete Product Error:', error);
    return res.status(500).json({ error: 'Internal server error deleting product.' });
  }
};
