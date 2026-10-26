
const prisma = require("../db");
async function postExists(id) {
  return prisma.post.findUnique({
    where: { id: Number(id) },
    select: { id: true },
  });
}

async function createPost(data) {
  return prisma.post.create({ data });
}

async function listPosts(options = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    order = "desc",
    location,
    search,
    from,
    to,
  } = options;

  const where = {};

  if (location !== undefined && location !== "") {
    where.location = { equals: location, mode: "insensitive" };
  }

  if (search !== undefined && search !== "") {
    where.caption = { contains: search, mode: "insensitive" };
  }

  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lt = new Date(to);
  }

  let orderBy;

  if (sortBy === "likes") {
    orderBy = [
      { likes: { _count: order } },
      { createdAt: "desc" },
    ];
  } else {
    orderBy = { [sortBy]: order };
  }

  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullname: true,
          },
        },
        _count: { select: { likes: true } },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function getPostById(id) {
  return prisma.post.findUnique({
    where: { id: Number(id) },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          fullname: true,
        },
      },
      _count: { select: { likes: true } },
    },
  });
}

async function updatePost(id, data) {
  return prisma.post.update({
    where: { id: Number(id) },
    data,
  });
}

async function deletePost(id) {
  return prisma.post.delete({
    where: { id: Number(id) },
  });
}

async function getPostsByUser(userId, page = 1, limit = 10) {
  const where = { authorId: Number(userId) };

  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { _count: { select: { likes: true } } },
    }),
    prisma.post.count({ where }),
  ]);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function getLikedPosts(userId, page = 1, limit = 10) {
  const where = {
    likes: { some: { userId: Number(userId) } },
  };

  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullname: true,
          },
        },
        _count: { select: { likes: true } },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

module.exports = {
  createPost,
  listPosts,
  getPostById,
  updatePost,
  deletePost,
  getPostsByUser,
  getLikedPosts,
  postExists,
};
