const postsService = require("../services/posts.service");
const usersService = require("../services/users.service");

function parsePositiveInteger(value) {
  if (value === undefined) return null;

  if (!/^\d+$/.test(value) || Number(value) <= 0) {
    return null;
  }

  return Number(value);
}

async function create(req, res) {
  const { username, email, fullname, bio } = req.body;

  if (!username || !email || !fullname) {
    return res.status(400).json({
      error: "username, email and fullname are required",
    });
  }

  try {
    const user = await usersService.createUser({
      username,
      email,
      fullname,
      ...(bio !== undefined ? { bio } : {}),
    });

    return res.status(201).json(user);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        error: "username or email already taken",
      });
    }

    throw error;
  }
}


async function list(req, res) {
  const {
    page: pageQuery,
    limit: limitQuery,
    sortBy,
    order,
    isPrivate,
    search,
    hasPosts,
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
    !["createdAt", "username", "fullname"].includes(sortBy)
  ) {
    return res.status(400).json({
      error: "sortBy must be one of: createdAt, username, fullname",
    });
  }

  if (order !== undefined && !["asc", "desc"].includes(order)) {
    return res.status(400).json({
      error: "order must be asc or desc",
    });
  }

  if (
    isPrivate !== undefined &&
    isPrivate !== "true" &&
    isPrivate !== "false"
  ) {
    return res.status(400).json({
      error: "isPrivate must be true or false",
    });
  }

  if (
    hasPosts !== undefined &&
    hasPosts !== "true" &&
    hasPosts !== "false"
  ) {
    return res.status(400).json({
      error: "hasPosts must be true or false",
    });
  }

  const result = await usersService.listUsers({
    page: page ?? 1,
    limit: Math.min(requestedLimit ?? 10, 50),
    sortBy: sortBy ?? "createdAt",
    order: order ?? "desc",
    isPrivate:
      isPrivate === undefined ? undefined : isPrivate === "true",
    search,
    hasPosts:
      hasPosts === undefined ? undefined : hasPosts === "true",
  });

  return res.status(200).json(result);
}



async function getOne(req, res) {
  const user = await usersService.getUserById(req.params.id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.status(200).json(user);
}


async function getPosts(req, res) {
  const user = await usersService.userExists(req.params.id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const page = parsePositiveInteger(req.query.page);
  const requestedLimit = parsePositiveInteger(req.query.limit);

  if (
    (req.query.page !== undefined && page === null) ||
    (req.query.limit !== undefined && requestedLimit === null)
  ) {
    return res.status(400).json({
      error: "page and limit must be positive integers",
    });
  }

  const result = await postsService.getPostsByUser(
    req.params.id,
    page ?? 1,
    Math.min(requestedLimit ?? 10, 50)
  );

  return res.status(200).json(result);
}

async function getLikedPosts(req, res) {
  const user = await usersService.userExists(req.params.id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const page = parsePositiveInteger(req.query.page);
  const requestedLimit = parsePositiveInteger(req.query.limit);

  if (
    (req.query.page !== undefined && page === null) ||
    (req.query.limit !== undefined && requestedLimit === null)
  ) {
    return res.status(400).json({
      error: "page and limit must be positive integers",
    });
  }

  const result = await postsService.getLikedPosts(
    req.params.id,
    page ?? 1,
    Math.min(requestedLimit ?? 10, 50)
  );

  return res.status(200).json(result);
}


async function update(req, res) {
  const { fullname, bio, isPrivate } = req.body;
  const data = {};

  if (fullname !== undefined) data.fullname = fullname;
  if (bio !== undefined) data.bio = bio;
  if (isPrivate !== undefined) data.isPrivate = isPrivate;

  try {
    const user = await usersService.updateUser(req.params.id, data);
    return res.status(200).json(user);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }

    throw error;
  }
}

async function remove(req, res) {
  try {
    await usersService.deleteUser(req.params.id);
    return res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }

    throw error;
  }
}

module.exports = {
  create,
  list,
  getOne,
  update,
  remove,
  getPosts,
  getLikedPosts,
};
