// State.js
import React from "react";

const COLORS = {
  excellent: "bg-[#A4F844] text-black",   // A'lo
  good:      "bg-[#4ADE80] text-white",   // Yaxshi
  normal:    "bg-[#60A5FA] text-white",   // O'rtacha
  bad:       "bg-[#FBBF24] text-black",   // Qoniqarsiz
  critical:  "bg-[#EF4444] text-white",   // Juda yomon
};

const LABELS = {
  excellent: "A'lo",
  good:      "Yaxshi",
  normal:    "O‘rtacha",
  bad:       "Qoniqarsiz",
  critical:  "Juda yomon",
};

function State({ status, className = "" }) {
  const colorClass = COLORS[status] || COLORS.normal;
  const label = LABELS[status] || LABELS.normal;

  return (
    <span
      className={`px-3 py-1 rounded-md text-sm font-semibold ${colorClass} ${className}`}
    >
      {label}
    </span>
  );
}

export default State;
