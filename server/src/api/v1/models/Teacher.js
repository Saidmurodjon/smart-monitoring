const mongoose = require("mongoose");
const Schema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    surName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    isPublished: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Teacher", Schema);
