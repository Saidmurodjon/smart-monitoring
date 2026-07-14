const prisma = require("../../../config/prisma");
const { withMongoId } = require("../../../utils/mongoCompat");
const Joi = require("joi");

const { getIO } = require("../../../ws");
// This is user model
const schema = Joi.object({
  name: Joi.string()
    .min(3)
    .required(),
  region: Joi.string()
    .min(3)
    .regex(/^[,. a-zA-Z]+$/)
    .required(),
  power: Joi.string(),
}).options({ stripUnknown: true });

function toId(raw) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

const GES_FIELDS = ["name", "power", "region", "status", "repair", "isAktive", "isPublished"];
function pickGesFields(body) {
  const data = {};
  for (const key of GES_FIELDS) {
    if (body[key] !== undefined) data[key] = body[key];
  }
  return data;
}

module.exports = {
  // Controller: GesList.js
  Get: async function (req, res) {
    try {
      const { name, region, power, repair } = req.query;
      console.log("Query params:", req.query);

      const where = {};

      // faqat mavjud bo‘lgan parametrlarga qarab filter qo‘shamiz
      if (name) {
        where.name = { contains: name, mode: "insensitive" };
      }

      if (region) {
        where.region = { contains: region, mode: "insensitive" };
      }

      if (power) {
        // power schema'da String, shuning uchun to‘g‘ridan-to‘g‘ri solishtiramiz
        where.power = String(power);
      }

      if (repair) {
        where.repair = { contains: repair, mode: "insensitive" };
      }

      const value = await prisma.ges.findMany({
        where,
        include: { aggregates: true },
      });

      if (!value || value.length === 0) {
        return res.status(204).send("No Content!");
      }

      res.status(200).send(withMongoId(value));
    } catch (error) {
      console.error("GES GET xato:", error);
      res.status(500).send("Server error");
    }
  },
  Post: async function (req, res, next) {
    try {
      const newDoc = await prisma.ges.create({ data: pickGesFields(req.body) });

      // endi io undefined bo‘lmaydi
      const io = getIO();
      io.emit("ges:new", withMongoId(newDoc));

      return res.status(201).json(withMongoId(newDoc));
    } catch (err) {
      console.error("GES POST xato:", err);
      return res.status(500).send("GES xatosi");
    }
  },
  Update: async function (req, res) {
    const { error } = schema.validate(req.body);
    if (error) {
      res.status(400).send(error.details[0].message);
      return;
    }
    const id = toId(req.body._id);
    if (!id) {
      res.status(204).send("No content");
      return;
    }
    let value;
    try {
      value = await prisma.ges.update({ where: { id }, data: pickGesFields(req.body) });
    } catch (err) {
      res.status(204).send("No content");
      return;
    }
    const io = getIO();
    io.emit("ges:update", withMongoId(value));
    res.status(200).json(withMongoId(value));
  },
  Delete: async function (req, res) {
    const id = toId(req.query?._id);
    console.log(req.query._id);

    if (!id) {
      res.status(204).send("No content");
      return;
    }
    try {
      await prisma.ges.delete({ where: { id } });
    } catch (err) {
      res.status(204).send("No content");
      return;
    }
    res.status(200).send("Muvaffaqiyatli o'chirildi.");

    getIO().emit("ges:remove", { _id: req.query._id });
  },
};
