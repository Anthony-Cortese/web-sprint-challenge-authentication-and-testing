const jwt = require("jsonwebtoken");
const { findBy } = require("../auth/auth-model");
const jwtsecret = require("../secrets/index");
// const { findBy } = require("../auth/auth-model"

const restricted = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    res.status(401).json({ message: "token required" });
  } else {
    jwt.verify(token, jwtsecret, (err, decoded) => {
      if (err) {
        res.status(401).json({ message: "token invalid" });
      } else {
        req.decodedToken = decoded;
        next();
      }
    });
  }
};

const registerUsername = async (req, res, next) => {
  const usersName = await findBy({ username: req.body.username });
  if (usersName) {
    res.status(409).json({ message: "username taken" });
    next();
  } else {
    next();
  }
};

const loginCredentials = async (req, res, next) => {
  try {
    const user = await findBy({
      username: req.body.username,
    });
    if (!user) {
      next({ status: 422, message: "invalid credentials" });
    } else {
      req.user = user;
      next();
    }
  } catch (err) {
    next(err);
  }
};

const emptyCredentials = (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(401).json({ message: "username and password required" });
  } else {
    next();
  }
};

module.exports = {
  restricted,
  registerUsername,
  loginCredentials,
  emptyCredentials,
};
