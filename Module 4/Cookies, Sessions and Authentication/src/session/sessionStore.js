const { randomBytes } = require('crypto');

const sessions = new Map();

const sessionTtl = Number(process.env.SESSION_TTL_MS || 3600000);

function create(userId) {
  const sessionId = randomBytes(32).toString('hex');

  const expiresAt = Date.now() + sessionTtl;

  sessions.set(sessionId, {
    userId,
    expiresAt,
  });

  return {
    sessionId,
    expiresAt,
  };
}

function get(sessionId) {
  if (!sessionId) {
    return null;
  }

  const session = sessions.get(sessionId);

  if (!session) {
    return null;
  }

  if (Date.now() >= session.expiresAt) {
    sessions.delete(sessionId);
    return null;
  }

  return session;
}

function destroy(sessionId) {
  if (sessionId) {
    sessions.delete(sessionId);
  }
}

module.exports = {
  create,
  get,
  destroy,
};