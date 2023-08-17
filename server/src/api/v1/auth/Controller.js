const jwt = require("jsonwebtoken");
const { JWT_KEY, JWT_EXPIRES_IN } = require("../../../config/swagger/config");
module.exports = {
  Login: async function (req, res) {

    try {
      const { password, login } = req.body;
      if (!password || !login) {
        return res.status(412).send("login va parolni to'liq kiriting");
      }
      if (password === "admin" && login === "admin") {
        const token = jwt.sign(
          Object.assign({ type: "admin" }, {new:true}),
          JWT_KEY,
          {
            algorithm: "HS256",
            expiresIn: JWT_EXPIRES_IN,
          }
        );
        return res.status(200).json({ token });
      }
      return res.status(401).send("login yoki parol noto'g'ri");
    } catch (error) {
      // throw error
      return res.status(417).send("so'rov amalga oshmadi");
    }
  },
};
