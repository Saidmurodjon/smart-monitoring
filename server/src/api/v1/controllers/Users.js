const bcrypt = require("bcryptjs");
const prisma = require("../../../config/prisma");
const { withMongoId } = require("../../../utils/mongoCompat");

const SALT_ROUNDS = 10;

// This is user model
module.exports = {
  Get: async function (req, res) {
    const value = await prisma.user.findMany();
    // parolni hech qachon javobga qo'shmaymiz
    res.status(200).send(withMongoId(value).map(({ password, ...u }) => u));
  },
  //User is created
  Post: async function (req, res) {
    const { email, password, fullName, phone, orgName } = req.body;
    try {
      if (!email || !password || !fullName || !phone || !orgName) {
        return res.status(412).send("Ma'lumotlarni to'liq kiriting");
      }
      const userCheck = await prisma.user.findUnique({ where: { email } });
      if (userCheck) {
        return res
          .status(403)
          .send("Ushbu foydalanuvchi avval ro'yxatdan o'tgan");
      }
      const hashed = await bcrypt.hash(password, SALT_ROUNDS);
      // Xavfsizlik: ro'yxatdan o'tishda rol har doim VIEWER — mijoz
      // so'rovidan rol qabul qilinmaydi (huquqni oshirishning oldini olish).
      await prisma.user.create({
        data: { email, password: hashed, fullName, phone, orgName, role: "VIEWER", provider: "local" },
      });
      return res.status(201).send("Siz ro'yxatdan o'tdingiz");
    } catch (err) {
      res.status(417).send("Yaratishda hatolik yuz berdi");
    }
  },

  /** PUT /api/v1/users/:id/role — faqat admin. Body: { role: "ADMIN"|"ENGINEER"|"VIEWER" } */
  UpdateRole: async function (req, res) {
    const id = Number(req.params.id);
    const { role } = req.body;
    const VALID_ROLES = ["ADMIN", "ENGINEER", "VIEWER"];
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).send("Yaroqsiz foydalanuvchi ID");
    }
    if (!VALID_ROLES.includes(role)) {
      return res.status(400).send("Yaroqsiz rol — ADMIN, ENGINEER yoki VIEWER bo'lishi kerak");
    }
    try {
      const updated = await prisma.user.update({ where: { id }, data: { role } });
      const { password, ...safe } = updated;
      return res.status(200).send(withMongoId(safe));
    } catch (err) {
      return res.status(404).send("Foydalanuvchi topilmadi");
    }
  },
};
