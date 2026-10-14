const postStore = require('../data/postStore');

const posts = postStore.posts;
let nextId = Math.max(0, ...posts.map((post) => post.id)) + 1;

function findAll() {
  return [...posts];
}

function findById(id) {
  return posts.find((post) => post.id === Number(id)) || null;
}

function create(fields) {
  const post = {
    id: nextId++,
    title: fields.title,
    body: fields.body || '',
    authorId: fields.authorId,
  };

  posts.push(post);
  return post;
}

function update(id, patch) {
  const post = findById(id);
  if (!post) return null;

  if (patch.title !== undefined) post.title = patch.title;
  if (patch.body !== undefined) post.body = patch.body;

  return post;
}

function remove(id) {
  const index = posts.findIndex((post) => post.id === Number(id));

  if (index === -1) return false;

  posts.splice(index, 1);
  return true;
}

// When switching to Prisma, change storage access and ID generation here.
// The five repository methods and the service interface remain unchanged.

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
};