const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    // To‘g‘ridan-to‘g‘ri obyektlar sifatida yozamiz, ref yoki sub-model yo‘q
    hydroTurbine: {
      model: String,
      ratedPowerKW: String,
      ratedHead_m: String,
      ratedFlow_m3s: String,
      runnerDiameter_mm: String,
      speed_rpm: String,
      efficiency: String,
      regulation: String,
      manufacturer: String,
      serialString: String,
      year: String,
      note: String,
    },

    hydroGenerator: {
      model: String,
      ratedPowerKW: String,
      voltage_V: String,
      current_A: String,
      frequency_Hz: String,
      cosphi: String,
      speed_rpm: String,
      cooling: String,
      efficiency: String,
      manufacturer: String,
      serialString: String,
      year: String,
      note: String,
    },

    transformer: {
      type: Object,
      ratedPower_kVA: String,
      primary_kV: String,
      secondary_kV: String,
      vectorGroup: String,
      impedance_percent: String,
      efficiency: String,
      cooling: String,
      oilType: String,
      manufacturer: String,
      serialString: String,
      year: String,
      note: String,
    },

    state: { type: String, default: "running" },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Aggregates", Schema);
