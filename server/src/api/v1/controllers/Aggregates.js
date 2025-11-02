const mongoose = require("mongoose");
const Aggregates = require("../models/Aggregates");
const Ges = require("../models/GesList");
// Agar socket.io bor bo'lsa (ixtiyoriy):
let getIO;
try { ({ getIO } = require("../../socket")); } catch (_) {}

/** yordamchi: id ni params|query|body dan oladi */
const takeId = (req) => req.params?.id || req.query?._id || req.body?._id;

/** GET /api/v1/aggregates?state=running */
exports.Get = async (req, res) => {
  const { state } = req.query;
  const q = {};
  if (state) q.state = state;

  const list = await Aggregates.find(q).lean();
  if (!list.length) return res.status(204).send("No Content");
  res.status(200).json(list);
};

/** (ixtiyoriy) GET /api/v1/aggregates/:id */
exports.GetOne = async (req, res) => {
  const id = takeId(req);
  if (!id) {
    const err = new Error("ID kiritilmagan");
    err.status = 400;
    throw err;
  }
  const doc = await Aggregates.findById(id).lean();
  if (!doc) {
    const err = new Error("Topilmadi");
    err.status = 404;
    throw err;
  }
  res.status(200).json(doc);
};

/** POST /api/v1/aggregates */
exports.Post = async (req, res) => {
  const gesId = req.params.gesId || req.body.gesId || req.query.gesId;
  if (!gesId || !mongoose.isValidObjectId(gesId)) {
    return res.status(400).send("Yaroqsiz yoki yo‘q gesId");
  }

  const session = await mongoose.startSession();
  let created;

  await session.withTransaction(async () => {
    // 1) GES mavjudligini tekshirish (session bilan)
    const ges = await Ges.findById(gesId).session(session).select("_id");
    if (!ges) {
      // withTransaction rollback qiladi; global handler xabarni loglaydi
      const err = new Error("GES topilmadi");
      err.status = 404;
      throw err;
    }

    // 2) Payload tayyorlash va agregatni yaratish (transaction ichida)
    const payload = { ...req.body, ges: gesId };
    delete payload.gesId;

    const docs = await Aggregates.create([payload], { session });
    created = docs[0];

    // 3) GES ichiga agregat _id ni qo‘shish (dublikatlardan himoya)
    await Ges.findByIdAndUpdate(
      gesId,
      { $addToSet: { aggregates: created._id } },
      { session }
    );
  });

  session.endSession();

  // 4) 201 + Location (yaxshi amaliyot)
  res
    .status(201)
    .location(`/api/v1/ges/${gesId}/aggregates/${created._id}`)
    .json(created);
};

/** PUT /api/v1/aggregates/:id yoki ?_id= */
exports.Update = async (req, res) => {
 let id =req.body._id
 console.log(id);
 
  if (!id) {
    const err = new Error("ID kiritilmagan");
    err.status = 400;
    throw err;
  }
  const updated = await Aggregates.findByIdAndUpdate(req.body._id, req.body);
  console.log(req.body);
  
  if (!updated) {
    const err = new Error("Topilmadi");
    err.status = 404;
    throw err;
  }
  res.status(200).json(updated);
  if (typeof getIO === "function") getIO().emit("aggregates:update", { _id: id });
};

/** DELETE /api/v1/aggregates/:id yoki ?_id= */
exports.Delete = async (req, res) => {
  const aggregateId = req.params.aggregateId || req.query._id || req.body._id;

  // ID valid emas — darhol chiqamiz
  if (!aggregateId || !mongoose.isValidObjectId(aggregateId))
    return res.status(400).send("Yaroqsiz yoki yo‘q aggregateId");

  const session = await mongoose.startSession();
  let deleted;

  await session.withTransaction(async () => {
    // 1️⃣ Agregatni o‘chirish
    deleted = await Aggregates.findByIdAndDelete(aggregateId, { session });
    if (!deleted) {
      // rollback bo‘ladi
      throw new Error("Agregat topilmadi");
    }

    // 2️⃣ GES dan ham id ni olib tashlash
    if (deleted.ges) {
      await Ges.findByIdAndUpdate(
        deleted.ges,
        { $pull: { aggregates: deleted._id } },
        { session }
      );
    }
  });

  session.endSession();

  // 3️⃣ Socket event
  getIO().emit("ges:removeAggregate", { _id: aggregateId, ges: deleted?.ges });

  // 4️⃣ Javob
  res.status(200).json({
    ok: true,
    message: "Agregat va bog‘liq GES havolasi muvaffaqiyatli o‘chirildi.",
    _id: aggregateId,
  });
};
