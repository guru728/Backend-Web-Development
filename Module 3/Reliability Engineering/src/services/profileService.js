
const DEFAULT_AVATAR = {
  url: 'default-avatar.png',
  initials: '?',
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function withTimeout(operation, timeoutMs) {
  const controller = new AbortController();
  let timer;

  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const error = new Error('Operation timed out');
      error.name = 'AbortError';
      controller.abort();
      reject(error);
    }, timeoutMs);
  });

  try {
    return await Promise.race([
      Promise.resolve().then(() => operation(controller.signal)),
      timeoutPromise,
    ]);
  } finally {
    clearTimeout(timer);
  }
}

function isRetryable(error) {
  if (!error) return false;
  if (error.name === 'AbortError') return true;
  if (error.status == null) return true;

  return error.status === 429 || error.status >= 500;
}

async function withRetry(operation, options = {}) {
  const {
    maxAttempts = 3,
    baseDelayMs = 100,
  } = options;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxAttempts - 1 || !isRetryable(error)) {
        throw error;
      }

      await sleep(baseDelayMs * (2 ** attempt));
    }
  }
}

async function getProfileWithAvatar(profileId, avatarClient) {
  const profile = { id: profileId };

  try {
    const avatar = await withRetry(
      () =>
        withTimeout(
          signal => avatarClient.getAvatar(profileId, { signal }),
          2000
        ),
      {
        maxAttempts: 3,
        baseDelayMs: 100,
      }
    );

    return {
      ...profile,
      avatar,
      degraded: false,
    };
  } catch (error) {
    return {
      ...profile,
      avatar: DEFAULT_AVATAR,
      degraded: true,
    };
  }
}

module.exports = {
  withTimeout,
  isRetryable,
  withRetry,
  getProfileWithAvatar,
  DEFAULT_AVATAR,
};
