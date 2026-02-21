/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#4F46E5', // Indigo-600
          light: '#818CF8',
          dark: '#3730A3',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F8FAFC',   // Slate-50
          highlight: '#EFF6FF', // Blue-50
        },
        status: {
          success: '#10B981', // Emerald-500
          warning: '#F59E0B', // Amber-500
          error: '#EF4444',   // Red-500
          info: '#3B82F6',    // Blue-500
        }
      }
    },
  },
  plugins: [],
}
