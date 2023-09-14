const Model = require("../models/Course");
const Joi = require("joi");
// This is user model
const schema = Joi.object({
  type: Joi.string(),
  name: Joi.string(),
  cost: Joi.number(),
  time: Joi.string(),
  teacher: Joi.array(),
  pupil: Joi.array(),
  pupilQuantity: Joi.string(),
  isAktive: Joi.boolean(),
}).options({ stripUnknown: true });
module.exports = {
  Get: async function (req, res) {
    const value = await Model.find().populate([
      "teacher",
      "pupil"
    ]);
    if (value.length <= 0) {
      res.status(404).send("No Content!");
      return;
    }
    res.status(200).send(value);
  },
  //User is created
  Post: async function (req, res) {
    const { error } = schema.validate(req.body);
    if (error) {
      res.status(400).send(error.details[0].message);
      return;
    }
    await Model.create(req.body);
    res.status(201).send("Muvaffaqiyatli yaratildi.");
  },
  Update: async function (req, res) {
    const { error } = schema.validate(req.body);
    if (error) {
      res.status(400).send(error.details[0].message);
      return;
    }
    const value = await Model.findByIdAndUpdate(req.query._id, req.body);
    if (!value) {
      res.status(204).send("No content");
      return;
    }
    res.status(200).send("Muvaffaqiyatli yangilandi.");
  },
  Delete: async function (req, res) {
    const value = await Model.findByIdAndDelete({ _id: req.query._id });
    if (!value) {
      res.status(204).send("No content");
      return;
    }
    res.status(200).send("Muvaffaqiyatli o'chirildi.");
  },
};
