
const postsService = require("../services/posts.service");
const usersService = require("../services/users.service");

function parsePositiveInteger(value) {
  if (value === undefined) return null;

  if (!/^\d+$/.test(value) || Number(value) <= 0) {
    return null;
  }

  return Number(value);
}

function isValidDate(value) {
  return value !== undefined && value !== "" &&
    !Number.isNaN(new Date(value).getTime());
}


async function create(req, res) {
  const { imageUrl, authorId, caption, location } = req.body;

  if (!imageUrl || authorId === undefined || authorId === null) {
    return res.status(400).json({
      error: "imageUrl and authorId are required",
    });
  }

  const author = await usersService.getUserById(Number(authorId));

  if (!author) {
    return res.status(404).json({ error: "User not found" });
  }

  const post = await postsService.createPost({
    imageUrl,
    authorId: Number(authorId),
    ...(caption !== undefined ? { caption } : {}),
    ...(location !== undefined ? { location } : {}),
  });

  return res.status(201).json(post);
}



async function list(req, res) {
  const {
    page: pageQuery,
    limit: limitQuery,
    sortBy,
    order,
    location,
    search,
    from,
    to,
  } = req.query;

  const page = parsePositiveInteger(pageQuery);
  const requestedLimit = parsePositiveInteger(limitQuery);

  if (
    (pageQuery !== undefined && page === null) ||
    (limitQuery !== undefined && requestedLimit === null)
  ) {
    return res.status(400).json({
      error: "page and limit must be positive integers",
    });
  }

  if (
    sortBy !== undefined &&
    !["createdAt", "updatedAt", "likes"].includes(sortBy)
  ) {
    return res.status(400).json({
      error: "sortBy must be one of: createdAt, updatedAt, likes",
    });
  }

  if (order !== undefined && !["asc", "desc"].includes(order)) {
    return res.status(400).json({
      error: "order must be asc or desc",
    });
  }

  function validDate(value) {
    return value !== undefined &&
      value !== "" &&
      !Number.isNaN(new Date(value).getTime());
  }

  if (
    (from !== undefined && !validDate(from)) ||
    (to !== undefined && !validDate(to))
  ) {
    return res.status(400).json({
      error: "from and to must be valid dates",
    });
  }

  const result = await postsService.listPosts({
    page: page ?? 1,
    limit: Math.min(requestedLimit ?? 10, 50),
    sortBy: sortBy ?? "createdAt",
    order: order ?? "desc",
    location,
    search,
    from,
    to,
  });

  return res.status(200).json(result);
}

async function getOne(req, res) {
  const post = await postsService.getPostById(req.params.id);

  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  return res.status(200).json(post);
}


async function update(req, res) {
  const { caption, location } = req.body;
  const data = {};

  if (caption !== undefined) data.caption = caption;
  if (location !== undefined) data.location = location;

  try {
    const post = await postsService.updatePost(req.params.id, data);
    return res.status(200).json(post);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Post not found" });
    }

    throw error;
  }
}

async function remove(req, res) {
  try {
    await postsService.deletePost(req.params.id);
    return res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Post not found" });
    }

    throw error;
  }
}

module.exports = { create, list, getOne, update, remove };
