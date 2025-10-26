const mongoose = require("mongoose");
// This is Pupil model
const Schema = new mongoose.Schema(
  {
    name: { type: String, require: true },
    power: { type: String, require: true },
    region: { type: String, require: false },
    status: { type: String, require: false },
    repair: { type: String, require: false },
    agregate: { type: String, require: false },

    // course: [
    //   { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Course" },
    // ],
    isAktive: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("GesList", Schema);
