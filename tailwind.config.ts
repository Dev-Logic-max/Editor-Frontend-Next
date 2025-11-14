/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // adjust path if needed
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'), 
  ],
}
