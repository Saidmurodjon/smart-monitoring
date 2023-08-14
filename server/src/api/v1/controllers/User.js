const Model = require("../models/Teacher");
// This is user model
module.exports = {
  Get: async function (req, res) {
    const value = await Model.find();
    res.status(200).send(value);
    // try {
    //   // throw new Error("Foydalanuvchi topilmadi");
    //   const value = await Model.find();
    //   console.log("rog");
    //   return res.status(200).send(value);
    // } catch (err) {
    //   res.status(400).send(err);
    // }
  },
  //User is created
  Post: async function (req, res) {
    const { email, password, fullName, phone, orgName } = req.body;
    try {
      if (!email || !password || !fullName || !phone || !orgName) {
        return res.status(412).send("Ma'lumotlarni to'liq kiriting");
      }
      const userCheck = await Model.findOne({ email: email });
      if (userCheck) {
        return res
          .status(403)
          .send("Ushbu foydalanuvchi avval ro'yxatdan o'tgan");
      }
      const value = await Model.create(req.body);
      return res.status(201).send("Siz ro'yxatdan o'tdingiz");
    } catch (err) {
      res.status(417).send("Yaratishda hatolik yuz berdi");
    }
  },
};
