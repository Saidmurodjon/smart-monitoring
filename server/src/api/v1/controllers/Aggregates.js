const prisma = require("../../../config/prisma");
const { withMongoId } = require("../../../utils/mongoCompat");
// Agar socket.io bor bo'lsa (ixtiyoriy):
let getIO;
try { ({ getIO } = require("../../../ws")); } catch (_) {}

function toId(raw) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/** yordamchi: id ni params|query|body dan oladi */
const takeId = (req) => req.params?.id || req.query?._id || req.body?._id;

const AGGREGATE_FIELDS = ["hydroTurbine", "hydroGenerator", "transformer", "state", "isPublished"];
function pickAggregateFields(body) {
  const data = {};
  for (const key of AGGREGATE_FIELDS) {
    if (body[key] !== undefined) data[key] = body[key];
  }
  return data;
}

/** GET /api/v1/aggregates?state=running */
exports.Get = async (req, res) => {
  const { state } = req.query;
  const where = {};
  if (state) where.state = state;

  const list = await prisma.aggregate.findMany({ where });
  if (!list.length) return res.status(204).send("No Content");
  res.status(200).json(withMongoId(list));
};

/** (ixtiyoriy) GET /api/v1/aggregates/:id */
exports.GetOne = async (req, res) => {
  const id = toId(takeId(req));
  if (!id) {
    const err = new Error("ID kiritilmagan");
    err.status = 400;
    throw err;
  }
  const doc = await prisma.aggregate.findUnique({ where: { id } });
  if (!doc) {
    const err = new Error("Topilmadi");
    err.status = 404;
    throw err;
  }
  res.status(200).json(withMongoId(doc));
};

/** POST /api/v1/aggregates */
exports.Post = async (req, res) => {
  const gesId = toId(req.params.gesId || req.body.gesId || req.query.gesId);
  if (!gesId) {
    return res.status(400).send("Yaroqsiz yoki yo‘q gesId");
  }

  let created;
  try {
    created = await prisma.$transaction(async (tx) => {
      const ges = await tx.ges.findUnique({ where: { id: gesId }, select: { id: true } });
      if (!ges) {
        const err = new Error("GES topilmadi");
        err.status = 404;
        throw err;
      }

      return tx.aggregate.create({
        data: { ...pickAggregateFields(req.body), gesId },
      });
    });
  } catch (err) {
    if (err.status === 404) return res.status(404).send(err.message);
    throw err;
  }

  res
    .status(201)
    .location(`/api/v1/ges/${gesId}/aggregates/${created.id}`)
    .json(withMongoId(created));
};

/** PUT /api/v1/aggregates/:id yoki ?_id= */
exports.Update = async (req, res) => {
  const id = toId(req.body._id);
  console.log(id);

  if (!id) {
    const err = new Error("ID kiritilmagan");
    err.status = 400;
    throw err;
  }
  let updated;
  try {
    updated = await prisma.aggregate.update({
      where: { id },
      data: pickAggregateFields(req.body),
    });
  } catch (err) {
    const notFound = new Error("Topilmadi");
    notFound.status = 404;
    throw notFound;
  }
  res.status(200).json(withMongoId(updated));
  if (typeof getIO === "function") getIO().emit("aggregates:update", { _id: String(id) });
};

/** DELETE /api/v1/aggregates/:id yoki ?_id= */
exports.Delete = async (req, res) => {
  const aggregateId = toId(req.params.aggregateId || req.query._id || req.body._id);

  // ID valid emas — darhol chiqamiz
  if (!aggregateId)
    return res.status(400).send("Yaroqsiz yoki yo‘q aggregateId");

  let deleted;
  try {
    deleted = await prisma.aggregate.delete({ where: { id: aggregateId } });
  } catch (err) {
    return res.status(404).send("Agregat topilmadi");
  }

  // Socket event
  if (typeof getIO === "function") {
    getIO().emit("ges:removeAggregate", { _id: String(aggregateId), ges: String(deleted.gesId) });
  }

  res.status(200).json({
    ok: true,
    message: "Agregat va bog‘liq GES havolasi muvaffaqiyatli o‘chirildi.",
    _id: String(aggregateId),
  });
};
