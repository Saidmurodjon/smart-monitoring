const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    teacher: [
      { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Teacher" },
    ],
    type: String,
    name: String,
    pupilQuantity: Number,
    isAktive: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Course", Schema);
