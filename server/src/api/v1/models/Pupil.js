const mongoose = require("mongoose");
// This is Pupil model
const Schema = new mongoose.Schema(
  {
    fullName: { type: String, require: true },
    position: { type: String, require: true },
    photo: { type: String, required: false },
    facebook: { type: String, require: false },
    telegram: { type: String, require: false },
    email: { type: String, require: false },
    isPublished: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Pupil", Schema);
