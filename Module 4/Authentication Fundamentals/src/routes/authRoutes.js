
const express = require('express');
const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');

const router = express.Router();

// REGISTER
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};

    // Validate required fields
    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Name, email and password are required'
        }
      });
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please provide a valid email address'
        }
      });
    }

    // Hash password
    const cost = Number(process.env.BCRYPT_COST || 12);

    const saltRounds =
      Number.isInteger(cost) && cost >= 4 && cost <= 31
        ? cost
        : 12;

    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user through repository
    const user = await userRepository.createUser({
      name: normalizedName,
      email: normalizedEmail,
      passwordHash
    });

    return res.status(201).json({
      message: 'Registration successful',
      user
    });

  } catch (error) {
    // Handle duplicate email
    if (error.code === 'P2002') {
      return res.status(409).json({
        error: {
          code: 'EMAIL_ALREADY_EXISTS',
          message: 'An account with this email already exists'
        }
      });
    }

    next(error);
  }
});

// LOGIN
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    // Validate required fields
    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password are required'
        }
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please provide a valid email address'
        }
      });
    }

    // Find user through repository
    const user = await userRepository.findUserByEmail(
      normalizedEmail
    );

    // Same error for unknown email and wrong password
    if (!user) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Compare password with stored hash
    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Return safe user details only
    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
