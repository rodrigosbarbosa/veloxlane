/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        midnight: "#0A1628",
        amber: "#E8A03D",
        cream: "#F8F6F1",
        asphalt: "#3D4550",
        teal: "#2DBFA6",
      },
    },
  },
  plugins: [],
};
