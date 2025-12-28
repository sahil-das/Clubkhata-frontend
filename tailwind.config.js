/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4f46e5", // indigo
        accent: "#22c55e",  // green
      },
    },
  },
  plugins: [],
}
