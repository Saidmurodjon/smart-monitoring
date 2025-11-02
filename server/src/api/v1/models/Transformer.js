const mongoose = require("mongoose");
// This is User model
const Schema = new mongoose.Schema(
  {
    name: { type: String, require: false },
    power: { type: String, require: false },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Transformer", Schema);
