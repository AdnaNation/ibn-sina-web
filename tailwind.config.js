/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        pine: { 950: '#072A2B', 900: '#0B3B3C', 800: '#0F4F51', 700: '#17686A', 600: '#228084', 100: '#D5E8E5', 50: '#EAF4F2' },
        paper: '#F5F9F8',
        ink: '#12292A',
        brass: { DEFAULT: '#B38A3C', light: '#E9D9B2' },
        alert: '#C23B2E',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
