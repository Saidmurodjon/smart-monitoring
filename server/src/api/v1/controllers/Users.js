const prisma = require("../../../config/prisma");
const { withMongoId } = require("../../../utils/mongoCompat");
// This is user model
module.exports = {
  Get: async function (req, res) {
    const value = await prisma.user.findMany();
    res.status(200).send(withMongoId(value));
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
      await prisma.user.create({
        data: { email, password, fullName, phone, orgName },
      });
      return res.status(201).send("Siz ro'yxatdan o'tdingiz");
    } catch (err) {
      res.status(417).send("Yaratishda hatolik yuz berdi");
    }
  },
};
