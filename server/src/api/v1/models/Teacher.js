const mongoose = require("mongoose");
const Schema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    pasport: { type: String, required: true },
    phone: { type: String, required: true },
    age: { type: Date, required: true },
    location: { type: String, required: false },
    subject: { type: String, required: true },
    isPublished: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Teacher", Schema);
