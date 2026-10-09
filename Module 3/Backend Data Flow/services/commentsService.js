const postsRepo = require('./../repository/postsRepo');
const commentsRepo = require('./../repository/commentsRepo');
const AppError = require('./../utils/AppError');

exports.addComment = async (postId, userId, body) => {
  // Rule 1: The post must exist.
  const post = await postsRepo.findById(postId);

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  // Rule 2: Locked posts cannot receive new comments.
  if (post.locked) {
    throw new AppError('Post is locked for new comments', 409);
  }

  // Both checks passed: create the comment.
  const comment = await commentsRepo.insert({
    postId,
    authorId: userId,
    body,
  });

  // Update the post's comment count.
  await postsRepo.incrementCommentCount(postId);

  // Return the newly created comment.
  return comment;
};
