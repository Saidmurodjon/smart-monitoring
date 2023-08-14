const Model = require("../models/User");
// This is user model
module.exports = {
  Get: async function (req, res) {
    const value = await Model.find();
    if (value) {
      throw new Error('data not found')
      res.status(404).send('Data not found!')
    }
    // res.status(200).send(value);
  },
  //User is created
  Post: async function (req, res) {
    const { email, password, fullName, phone, orgName } = req.body;

    // if (!email || !password || !fullName || !phone || !orgName) {
    //   return res.status(412).send("Ma'lumotlarni to'liq kiriting");
    // }
    const userCheck = await Model.findOne({ email: email });
    // throw new Error("dkmsdfsd")
    if (userCheck) {  
      return res
        .status(403)
        .send("Ushbu foydalanuvchi avval ro'yxatdan o'tgan");
    }
    const value = await Model.create(req.body);
    return res.status(201).send("Siz ro'yxatdan o'tdingiz");
  },
};
