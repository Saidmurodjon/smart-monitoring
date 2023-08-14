const Model = require("./../models/Contact");
// This is Contact controller
module.exports = {
  Get: async function (req, res) {
    try {
      const value = await Model.find().populate("author");
      return res.status(200).send(value);
    } catch (err) {
      res.status(400).send(err);
    }
  },
  //Contact is created
  Post: async function (req, res) {
    const { fullName, email, message, phone } = req.body;
    try {
      if (!fullName || !email || !message || !phone) {
        return res.status(412).send("Ma'lumotlarni to'liq kiriting");
      }
      const value = await Model.create(req.body);
      return res.status(201).send(value);
    } catch (err) {
      res.status(500).send("Yaratishda hatolik yuz berdi");
    }
  },
};
