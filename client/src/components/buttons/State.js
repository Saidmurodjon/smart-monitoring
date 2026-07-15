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

// Fuzzy Logic (FIS) natijalari aynan shu matnli holat nomlarini qaytaradi
// (server/src/services/fuzzyEngine/variableSets.js OUTPUT_CLASS_LABELS
// bilan bir xil) — shu sabab to'g'ridan-to'g'ri `status="A'lo"` kabi
// qiymatlar bilan ham ishlaydigan qilib moslashtirildi.
const FIS_STATUS_TO_KEY = {
  "A'lo": "excellent",
  "Yaxshi": "good",
  "O'rtacha": "normal",
  "Yomon": "bad",
  "Juda yomon": "critical",
};

function State({ status, className = "" }) {
  const key = FIS_STATUS_TO_KEY[status] || status;
  const colorClass = COLORS[key] || COLORS.normal;
  const label = LABELS[key] || status || LABELS.normal;

  return (
    <span
      className={`px-3 py-1 rounded-md text-sm font-semibold ${colorClass} ${className}`}
    >
      {label}
    </span>
  );
}

export default State;
