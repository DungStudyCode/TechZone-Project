// client/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Dòng này QUAN TRỌNG NHẤT
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}