/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#D4AF37', // matching --accent-primary
        secondary: '#B45309', // matching --accent-secondary
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6',
      }
    },
  },
  plugins: [],
}
