const sessionTtl = Number(process.env.SESSION_TTL_MS || 3600000);

if (!Number.isFinite(sessionTtl) || sessionTtl <= 0) {
  throw new Error('SESSION_TTL_MS must be a positive number');
}

const cookieOptions = {
  httpOnly: true,
  signed: true,
  sameSite: 'lax',
  secure:
    process.env.COOKIE_SECURE === 'true' ||
    process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: sessionTtl,
};

module.exports = cookieOptions;