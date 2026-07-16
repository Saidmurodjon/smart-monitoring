const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const prisma = require("../../../config/prisma");
const { JWT_KEY, JWT_EXPIRES_IN } = require("../../../config/swagger/config");

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_KEY,
    { algorithm: "HS256", expiresIn: JWT_EXPIRES_IN },
  );
}

module.exports = {
  signToken,
  Login: async function (req, res) {
    try {
      const { password, login } = req.body;
      if (!password || !login) {
        return res.status(412).send("login va parolni to'liq kiriting");
      }

      const user = await prisma.user.findUnique({ where: { email: login } });
      // Google orqali ro'yxatdan o'tgan hisobda parol bo'lmasligi mumkin —
      // bunday hisob parol bilan kira olmaydi.
      if (!user || !user.password) {
        return res.status(401).send("login yoki parol noto'g'ri");
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).send("login yoki parol noto'g'ri");
      }

      // SENDMAIL.md — parol to'g'ri tekshirilgandan KEYIN holat tekshiriladi
      // (noto'g'ri parol taxminiga hisob holati haqida ma'lumot sizdirilmaydi).
      if (user.status === "PENDING") {
        return res
          .status(403)
          .send("Hisobingiz hali administrator tomonidan tasdiqlanmagan. Tasdiqlangach sizga email orqali xabar boradi.");
      }
      if (user.status === "REJECTED") {
        return res
          .status(403)
          .send("Hisobingizga ruxsat berilmadi. Batafsil ma'lumot uchun administratorga murojaat qiling.");
      }

      const token = signToken(user);
      return res.status(200).json({ token });
    } catch (error) {
      return res.status(417).send("so'rov amalga oshmadi");
    }
  },
};
