const Model = require("../models/Pupil");
const Joi = require("joi");
// This is user model
module.exports = {
  Get: async function (req, res) {
    const value = await Model.find().populate(['teacher','course']);
    if (value.length <= 0) {
      res.status(204).send("No Content!");
      return;
    }
    res.status(200).send(value);
  },
  //User is created
  Post: async function (req, res) {
    const schema = Joi.object({
      firstName: Joi.string()
        .min(3)
        .regex(/^[,. a-zA-Z]+$/)
        .required(),
      lastName: Joi.string()
        .min(3)
        .regex(/^[,. a-zA-Z]+$/)
        .required(),
      teacher: Joi.string(),
      course: Joi.string(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
      res.status(400).send(error.details[0].message);
      return;
    }
    await Model.create(req.body);
    res.status(201).send("Muvaffaqiyatli yaratildi.");
  },
  Update: async function (req, res) {
    const schema = Joi.object({
      firstName: Joi.string()
        .min(3)
        .regex(/^[,. a-z]+$/)
        .required(),
      lastName: Joi.string()
        .min(3)
        .regex(/^[,. a-z]+$/)
        .required(),
    });
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
