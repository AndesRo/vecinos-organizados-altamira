/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#102A43", 50: "#F0F4F8", 100: "#D9E2EC", 700: "#243B53", 900: "#102A43" },
        teal: { DEFAULT: "#20B8B0", 50: "#E6F9F7", 600: "#1BA39B", 700: "#158A83" },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};