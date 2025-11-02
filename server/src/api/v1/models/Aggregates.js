const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    // To‘g‘ridan-to‘g‘ri obyektlar sifatida yozamiz, ref yoki sub-model yo‘q

    hydroTurbine: {
      model: String,
      power: Number,
      efficiency: Number,
      serialNumber: String,
      year: Number,
      },

    hydroGenerator: {
      model: String,
      power: Number,
      voltage_V: Number,
      cosphi: Number,
      efficiency: Number,
      serialNumber: String,
      year: Number,
    },

    transformer: {
      type: Object,
      model:String,
      power: Number,
      primary_kV: Number,
      secondary_kV: Number,
      efficiency: Number,
      cooling: String,
      serialNumber: String,
      year: Number,
    },
 ges: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ges",
      required: true,
    },
    state: { type: String, default: "running" },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Aggregates", Schema);
