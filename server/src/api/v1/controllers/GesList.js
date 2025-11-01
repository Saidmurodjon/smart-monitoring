const Model = require("../models/GesList");
const Joi = require("joi");

const { getIO } = require("../../../ws");
// This is user model
const schema = Joi.object({
  name: Joi.string()
    .min(3)
    // .regex(/^[,. a-zA-Z]+$/)
    .required(),
  region: Joi.string()
    .min(3)
    .regex(/^[,. a-zA-Z]+$/)
    .required(),
  power: Joi.string(),
  // aggregate: Joi.string().email(),
  // phone: Joi.string()
  //   .min(10)
  //   .pattern(/^[0-9]+$/)
  //   .required(),
  // age: Joi.date(),
  // location: Joi.string(),
  // cupon: Joi.string(),
  // gender: Joi.string(),
  // course: Joi.string(),
  // homePhone: Joi.string(),
}).options({ stripUnknown: true });
module.exports = {
// Controller: GesList.js
Get: async function (req, res) {
  try {
    const { name, region, power, repair } = req.query;
    console.log("Query params:", req.query);

    const query = {};

    // faqat mavjud bo‘lgan parametrlarga qarab filter qo‘shamiz
    if (name) {
      // nom qisman mos bo‘lishi uchun regex bilan
      query.name = { $regex: name, $options: "i" };
    }

    if (region) {
      query.region = { $regex: region, $options: "i" };
    }

    if (power) {
      // son bo‘lsa, to‘g‘ridan-to‘g‘ri solishtirish
      query.power = Number(power);
    }

    if (repair) {
      query.repair = { $regex: repair, $options: "i" };
    }

    // Agar hech qanday query berilmagan bo‘lsa — hammasini qaytaramiz
    const value = Object.keys(query).length
      ? await Model.find(query)
      .populate("aggregates")
      : await Model.find()
      .populate("aggregates");

    if (!value || value.length === 0) {
      return res.status(204).send("No Content!");
    }

    res.status(200).send(value);
  } catch (error) {
    console.error("GES GET xato:", error);
    res.status(500).send("Server error");
  }
},
    Post: async function (req, res, next) {
    try {
      const newDoc = await Model.create(req.body);

      // endi io undefined bo‘lmaydi
      const io = getIO();
      io.emit("ges:new", newDoc);

      return res.status(201).json(newDoc);
    } catch (err) {
      console.error("GES POST xato:", err);
      return res.status(500).send("Server xatosi");
    }
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
    const io = getIO();
    io.emit("ges:update", value);
    res.status(200).json(value);
  },
  Delete: async function (req, res) {
    const value = await Model.findByIdAndDelete({ _id: req.query?._id });
    console.log(req.query._id);
    
    if (!value) {
      res.status(204).send("No content");
      return;
    }
    res.status(200).send("Muvaffaqiyatli o'chirildi.");

    getIO().emit("ges:remove", { _id: req.query._id });
  },

};
