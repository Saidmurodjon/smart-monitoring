const mongoose = require("mongoose");
// This is Pupil model
const Schema = new mongoose.Schema(
  {
    firstName: { type: String, require: true },
    lastName: { type: String, require: true },
    email: { type: String, require: false },
    phone: { type: String, require: false },
    homePhone: { type: String, require: false },
    age: { type: String, require: false },
    location: { type: String, require: false },
    pasport: { type: String, require: false },
    cupon: { type: String, require: false },
    gender: { type: String, require: false },
    course: [
      { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Course" },
    ],
    isAktive: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Pupil", Schema);
