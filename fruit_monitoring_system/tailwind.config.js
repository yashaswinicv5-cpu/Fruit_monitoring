/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 40px rgba(56, 189, 248, 0.15)',
      },
      colors: {
        surface: {
          900: '#020617',
          800: '#0f172a',
          700: '#111827',
          100: '#f8fafc',
        },
      },
    },
  },
  plugins: [],
};