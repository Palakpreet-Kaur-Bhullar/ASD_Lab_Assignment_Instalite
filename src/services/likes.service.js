
const prisma = require("../db");

async function listLikesForPost(postId) {
  const likes = await prisma.like.findMany({
    where: { postId: Number(postId) },
    orderBy: { user: { username: "asc" } },
    select: {
      user: {
        select: {
          id: true,
          username: true,
          fullname: true,
        },
      },
    },
  });

  return likes.map((like) => like.user);
}

async function createLike(userId, postId) {
  return prisma.like.create({
    data: {
      userId: Number(userId),
      postId: Number(postId),
    },
  });
}

async function deleteLike(userId, postId) {
  return prisma.like.delete({
    where: {
      userId_postId: {
        userId: Number(userId),
        postId: Number(postId),
      },
    },
  });
}

module.exports = {
  listLikesForPost,
  createLike,
  deleteLike,
};
