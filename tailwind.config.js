/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        pine: {
          950: "#02281F",
          900: "#00573F",
          800: "#006A4E",
          700: "#0A8460",
          600: "#1F9C74",
          100: "#D3EBE1",
          50: "#EAF6F1",
        },
        paper: "#F4FAF7",
        ink: "#10241D",
        brass: { DEFAULT: "#E9A820", light: "#FBE7B0" },
        alert: "#DC2440",
        flag: "#F42A41",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
