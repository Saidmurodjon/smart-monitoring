const jwt = require("jsonwebtoken");

const { JWT_KEY } = require("../../../config/swagger/config");

module.exports = async (req, res, next) => {
  try {
    let JWT = req.headers["auth"];

    jwt.verify(JWT, JWT_KEY, (err, a) => {
      console.log(err);
      if (err) {
        return res.status(403).send("UnAuthentication");
      }
      return next();
    });
  } catch (error) {
    return res.status(403).send("Authentication failed");
  }
};
