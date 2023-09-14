const mongoose = require("mongoose");
// This is Pupil model
const Schema = new mongoose.Schema(
  {
    cost: { type: String, require: true },
    discount: { type: String, require: false },//? to do
    email: { type: String, require: false },
    pupilID: [
      { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Pupil" },
    ],
    isAktive: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Billing", Schema);
