const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'cloudcart_jwt_secret_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Register a new user
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please provides name, email, and password.' });
  }

  try {
    // Check if user already exists
    const userExistQuery = 'SELECT id FROM users WHERE email = $1';
    const existingUser = await db.query(userExistQuery, [email.toLowerCase().trim()]);

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'A user with this email address already exists.' });
    }

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Save user to the database
    const insertUserQuery = `
      INSERT INTO users (name, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, created_at
    `;
    const result = await db.query(insertUserQuery, [
      name.trim(),
      email.toLowerCase().trim(),
      passwordHash
    ]);

    const newUser = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    console.log(`User registered successfully: ${newUser.email}`);
    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: newUser
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
};

// Login user
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide both email and password.' });
  }

  try {
    // Find user by email
    const findUserQuery = 'SELECT id, name, email, password_hash, created_at FROM users WHERE email = $1';
    const result = await db.query(findUserQuery, [email.toLowerCase().trim()]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    console.log(`User logged in successfully: ${user.email}`);
    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
};

// Get profile details
exports.getProfile = async (req, res) => {
  // req.user is set by authMiddleware
  const userId = req.user.id;

  try {
    const findUserQuery = 'SELECT id, name, email, created_at FROM users WHERE id = $1';
    const result = await db.query(findUserQuery, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    return res.status(200).json({ user: result.rows[0] });
  } catch (error) {
    console.error('Profile Retrieval Error:', error);
    return res.status(500).json({ error: 'Internal server error retrieving user profile.' });
  }
};
