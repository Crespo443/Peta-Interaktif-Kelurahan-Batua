/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4DB6AC",
        secondary: "#45B7D1",
        "bg-light": "#F8FAFC",
        "bg-dark": "#0F172A",
      },
      fontFamily: {
        display: ["'Plus Jakarta Sans'", "sans-serif"],
      },
      borderRadius: {
        large: "1.25rem",
      },
    },
  },
  plugins: [],
};
