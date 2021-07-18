const router = require("express").Router();
const jwt = require("jsonwebtoken");
const jwtsecret = require("../secrets/index");
const bcrypt = require("bcrypt");
const Auth = require("./auth-model");
const {
  emptyCredentials,
  registerUsername,
  loginCredentials,
} = require("../middleware/restricted");

router.post("/register", emptyCredentials, registerUsername, (req, res) => {
  const { username, password } = req.body;
  const hash = bcrypt.hashSync(password, 6);
  Auth.registering({ username, password: hash })
    .then((registeredUser) => {
      res.status(201).json(registeredUser);
    })
    .catch((err) => {
      res.status(400).json(err, "you were unable to register");
    });
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.
    DO NOT EXCEED 2^8 ROUNDS OF HASHING!

    1- In order to register a new account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel", // must not exist already in the `users` table
        "password": "foobar"          // needs to be hashed before it's saved
      }

    2- On SUCCESSFUL registration,
      the response body should have `id`, `username` and `password`:
      {
        "id": 1,
        "username": "Captain Marvel",
        "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
      }

    3- On FAILED registration due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED registration due to the `username` being taken,
      the response body should include a string exactly as follows: "username taken".
  */
});

router.post("/login", emptyCredentials, loginCredentials, (req, res, next) => {
  if (bcrypt.compareSync(req.body.password, req.user.password)) {
    const token = makeToken(req.user);
    res.json({ message: `welcome, ${req.user.username}`, token });
  } else {
    next({ status: 422, message: "invalid credentials" });
  }
});
/*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to log into an existing account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel",
        "password": "foobar"
      }

    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }

    3- On FAILED login due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */
// router.get("/logout", (req, res, next) => {
//   if (req.session.user) {
//     req.session.destroy((err) => {
//       if (err) {
//         res.status(400).json("Sorry cant log out" + err.message);
//       } else {
//         res.status(200).json("logged out");
//       }
//     });
//   } else {
//     res.status(200).json("no session");
//   }
// });

function makeToken(user) {
  const payload = {
    subject: user.id,
    username: user.username,
  };
  const options = {
    expiresIn: "24h",
  };
  return jwt.sign(payload, jwtsecret, options);
}

module.exports = router;
