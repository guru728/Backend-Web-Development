
const express = require('express');
const bcrypt = require('bcryptjs');

const prisma = require('../db/prisma');
const sessionStore = require('../session/sessionStore');
const requireSession = require('../middleware/requireSession');
const cookieOptions = require('../config/cookieOptions');

const router = express.Router();

// POST /auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        error: {
          code: 'INVALID_INPUT',
          message: 'Email and password are required',
        },
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Use the same response for an unknown email or incorrect password.
    if (!user) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    }

    const session = sessionStore.create(user.id);

    res.cookie('sid', session.sessionId, cookieOptions);

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /auth/me
router.get('/me', requireSession, (req, res) => {
  return res.status(200).json({
    user: req.user,
  });
});

// POST /auth/logout
router.post('/logout', (req, res) => {
  const sessionId = req.signedCookies?.sid;

  if (sessionId && typeof sessionId === 'string') {
    sessionStore.destroy(sessionId);
  }

  const { maxAge, ...clearOptions } = cookieOptions;

  res.clearCookie('sid', clearOptions);

  return res.status(204).end();
});

module.exports = router;
