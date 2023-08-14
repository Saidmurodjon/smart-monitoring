const Model = require("../models/Course");
// This is pochta controller
module.exports = {
  Get: async function (req, res) {
//  throw new Error("cource error")
      const value = await Model.find();
      return res.status(200).send(value);
  },
  Post: async function (req, res) {
    const value = await Model.create(req.body);
    return res.status(200).send(value);
  },
};
