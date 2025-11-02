const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    // To‘g‘ridan-to‘g‘ri obyektlar sifatida yozamiz, ref yoki sub-model yo‘q
    hydroTurbine: {
      model: String,
      ratedPowerKW: Number,
      ratedHead_m: Number,
      ratedFlow_m3s: Number,
      runnerDiameter_mm: Number,
      speed_rpm: Number,
      efficiency: Number,
      regulation: String,
      manufacturer: String,
      serialNumber: String,
      year: Number,
      note: String,
    },

    hydroGenerator: {
      model: String,
      ratedPowerKW: Number,
      voltage_V: Number,
      current_A: Number,
      frequency_Hz: Number,
      cosphi: Number,
      speed_rpm: Number,
      cooling: String,
      efficiency: Number,
      manufacturer: String,
      serialNumber: String,
      year: Number,
      note: String,
    },

    transformer: {
      type: Object,
      ratedPower_kVA: Number,
      primary_kV: Number,
      secondary_kV: Number,
      vectorGroup: String,
      impedance_percent: Number,
      efficiency: Number,
      cooling: String,
      oilType: String,
      manufacturer: String,
      serialNumber: String,
      year: Number,
      note: String,
    },

    state: { type: String, default: "running" },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Aggregates", Schema);
