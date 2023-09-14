const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    teacher: [
      { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Teacher" },
    ],
    pupil: [
      { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Pupil" },
    ],
    type: { type: String, required: false },
    name: { type: String, required: false },
    cost: { type: Number, required: false },
    time: { type: String, required: false },
    pupilQuantity: { type: String, required: false },
    isAktive: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Course", Schema);
