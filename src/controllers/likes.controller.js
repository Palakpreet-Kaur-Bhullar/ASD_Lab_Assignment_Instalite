// Bonus also completed
const likesService = require("../services/likes.service");
const usersService = require("../services/users.service");
const postsService = require("../services/posts.service");

async function list(req, res) {
  const post = await postsService.postExists(req.params.id);

  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  const likes = await likesService.listLikesForPost(req.params.id);
  return res.status(200).json(likes);
}

async function create(req, res) {
  const { userId } = req.body;

  if (userId === undefined || userId === null) {
    return res.status(400).json({ error: "userId is required" });
  }

  const post = await postsService.getPostById(req.params.id);

  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  const user = await usersService.userExists(userId);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  try {
    const like = await likesService.createLike(userId, req.params.id);
    return res.status(201).json(like);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Already liked" });
    }

    throw error;
  }
}

async function remove(req, res) {
  try {
    await likesService.deleteLike(req.params.userId, req.params.id);
    return res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Like not found" });
    }

    throw error;
  }
}

module.exports = { list, create, remove };
