const Model = require("../models/Pupil");
const Joi = require("joi");
// This is user model
const schema = Joi.object({
  firstName: Joi.string()
    .min(3)
    .regex(/^[,. a-zA-Z]+$/)
    .required(),
  lastName: Joi.string()
    .min(3)
    .regex(/^[,. a-zA-Z]+$/)
    .required(),
  pasport: Joi.string(),
  email: Joi.string().email(),
  phone: Joi.string()
    .min(10)
    .pattern(/^[0-9]+$/)
    .required(),
  age: Joi.date(),
  location: Joi.string(),
  cupon: Joi.string(),
  gender: Joi.string(),
  course: Joi.string(),
  homePhone: Joi.string(),
}).options({ stripUnknown: true });
module.exports = {
  Get: async function (req, res) {
    const { firstName, lastName, startDate, endDate } = req.query;
    console.log(req.query);
    const query = {};
    if (firstName) {
      query.firstName = firstName;
    }
    if (lastName) {
      query.lastName = lastName;
    }
    if (startDate & endDate) {
      query.date = {
        $gt: startDate,
        $lt: endDate,
      };
    }
    const value = await Model.find(query);

    console.log(value);
    // const value = await Model.find().populate("course");
    if (value.length <= 0) {
      res.status(204).send("No Content!");
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
    const value = await Model.findByIdAndUpdate(req.body._id, req.body);
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
