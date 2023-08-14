const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    author: [
      { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    ],
    message: String,
    type: { type: String },
    isOrdered: String,
    isPublished: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Order", Schema);
