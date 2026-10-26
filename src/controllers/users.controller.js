
const usersService = require("../services/users.service");

async function create(req, res) {
  const { username, email, fullname, bio } = req.body || {};

  if (!username || !email || !fullname) {
    return res.status(400).json({
      error: "username, email and fullname are required"
    });
  }

  const data = { username, email, fullname };

  if (bio !== undefined) {
    data.bio = bio;
  }

  try {
    const user = await usersService.createUser(data);
    return res.status(201).json(user);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        error: "username or email already taken"
      });
    }

    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function list(req, res) {
  try {
    const users = await usersService.listUsers();
    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getOne(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({ error: "User not found" });
  }

  try {
    const user = await usersService.getUserById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function update(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({ error: "User not found" });
  }

  const body = req.body || {};
  const data = {};

  if (body.fullname !== undefined) data.fullname = body.fullname;
  if (body.bio !== undefined) data.bio = body.bio;
  if (body.isPrivate !== undefined) data.isPrivate = body.isPrivate;

  try {
    const user = await usersService.updateUser(id, data);
    return res.status(200).json(user);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }

    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function remove(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({ error: "User not found" });
  }

  try {
    await usersService.deleteUser(id);
    return res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }

    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  create,
  list,
  getOne,
  update,
  remove
};
