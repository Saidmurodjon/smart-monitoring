/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/react-tailwindcss-datepicker/dist/index.esm.js",
    "./node_modules/react-tailwindcss-select/dist/index.esm.js"
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      keyframes: {
        // tashqi to'lqin: radius oshib yo'qoladi
        ripple: {
          "0%":   { transform: "scale(1)",    opacity: "0.8" },
          "70%":  { transform: "scale(2.5)",  opacity: "0.2" },
          "100%": { transform: "scale(3)",    opacity: "0"   },
        },
        // ichki puls: markaz "dup-dup"
        "pulse-dot": {
          "0%":   { transform: "scale(1)" },
          "50%":  { transform: "scale(1.35)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        ripple: "ripple 1.8s ease-out infinite",
        "pulse-dot": "pulse-dot 0.9s ease-in-out infinite",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("daisyui")
  ],
  daisyui: {
    themes: ["light", "dark"],
  },
}
