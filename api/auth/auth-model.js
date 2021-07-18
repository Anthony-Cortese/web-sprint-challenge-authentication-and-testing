const db = require("../../data/dbConfig");

async function registering(potentialUser) {
  const [id] = await db("users").insert(potentialUser);
  return db("users").where("id", id).first();
}

function findBy(filter) {
  return db("users").select("id", "username", "password").where(filter).first();
}

module.exports = {
  registering,
  findBy,
};
