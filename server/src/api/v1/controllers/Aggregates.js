const Aggregates = require("../models/Aggregates");
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
  const payload = req.body || {};
  console.log(req.body);
  
  const doc = await Aggregates.create(payload);

  
  res.status(201).json(doc);
};

/** PUT /api/v1/aggregates/:id yoki ?_id= */
exports.Update = async (req, res) => {
  const id = takeId(req);
  if (!id) {
    const err = new Error("ID kiritilmagan");
    err.status = 400;
    throw err;
  }
  const updated = await Aggregates.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
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
  const id = takeId(req);
  if (!id) {
    const err = new Error("ID kiritilmagan");
    err.status = 400;
    throw err;
  }
  const deleted = await Aggregates.findByIdAndDelete(id);
  if (!deleted) {
    const err = new Error("Topilmadi");
    err.status = 404;
    throw err;
  }
  res.status(200).json({ message: "Muvaffaqiyatli o'chirildi", _id: id });
  if (typeof getIO === "function") getIO().emit("aggregates:remove", { _id: id });
};
