/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2c3e50',
        accent: '#3498db',
        success: '#2ecc71',
        warning: '#f1c40f',
        danger: '#e74c3c',
      }
    },
  },
  plugins: [],
}
