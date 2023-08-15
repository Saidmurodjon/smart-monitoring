const mongoose = require("mongoose");
// This is Pupil model
const Schema = new mongoose.Schema(
  {
    firstName: { type: String, require: true },
    lastName: { type: String, require: true },
    email: { type: String, require: false },
    isPublished: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Pupil", Schema);
