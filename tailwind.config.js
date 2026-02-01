/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        academic: {
          navy: '#1e3a8a',      // Deep blue for headers
          blue: '#3b82f6',       // Primary actions
          sky: '#0ea5e9',        // Accents
          slate: '#64748b',      // Secondary text
          white: '#ffffff',      // Clean backgrounds
          success: '#10b981',    // Vote success
          warning: '#f59e0b',    // Moderate votes
          danger: '#ef4444',     // High priority topics
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
}
