const mongoose = require("mongoose");
// This is User model
const Schema = new mongoose.Schema(
  {
    fullName: { type: String, require: false },
    orgName: { type: String, require: false },
    phone: { type: String, default: "+998" },
    email: { type: String, require: true },
    password: { type: String, require: true },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("User", Schema);
