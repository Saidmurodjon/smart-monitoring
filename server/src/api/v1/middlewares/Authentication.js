const jwt = require("jsonwebtoken");

const { JWT_KEY } = require("../../../config/swagger/config");

// JWT'ni tekshiradi va payload'ni `req.user = { id, email, role }` sifatida
// keyingi middleware/controllerlarga uzatadi (ROLES.md §6 — requireRole shu
// yerga tayanadi).
module.exports = async (req, res, next) => {
  try {
    const header = req.headers["authorization"];
    const token = header?.startsWith("Bearer ") ? header.slice(7) : req.headers["auth"];

    if (!token) {
      return res.status(401).send("Tizimga kirish talab qilinadi");
    }

    jwt.verify(token, JWT_KEY, (err, payload) => {
      if (err) {
        return res.status(403).send("Yaroqsiz yoki muddati o'tgan token");
      }
      req.user = { id: payload.id, email: payload.email, role: payload.role };
      return next();
    });
  } catch (error) {
    return res.status(403).send("Autentifikatsiya amalga oshmadi");
  }
};
