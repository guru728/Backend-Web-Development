
const store = require('../data/postStore');

function listPosts(query = {}) {
  const page = Number(query.page ?? 1);
  const requestedLimit = Number(query.limit ?? 2);

  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(requestedLimit) ||
    requestedLimit < 1
  ) {
    const err = new Error('Page and limit must be positive whole numbers');
    err.statusCode = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const limit = Math.min(requestedLimit, 100);
  const allPosts = store.getAllPosts();
  const total = allPosts.length;
  const start = (page - 1) * limit;
  const rows = allPosts.slice(start, start + limit);

  return {
    rows,
    meta: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}

function getPost(id) {
  return store.getPostById(id);
}

function createPost(body = {}) {
  const title =
    typeof body.title === 'string' ? body.title.trim() : '';
  const author =
    typeof body.author === 'string' ? body.author.trim() : '';

  if (!title || !author) {
    const err = new Error('Title and author are required');
    err.statusCode = 400;
    err.code = 'VALIDATION_ERROR';
    err.details = {
      required: ['title', 'author']
    };
    throw err;
  }

  return store.createPost({ title, author });
}

function likePost(id) {
  return store.incrementLikes(id);
}

function explode() {
  throw new Error('Simulated internal failure');
}

module.exports = {
  listPosts,
  getPost,
  createPost,
  likePost,
  explode
};
