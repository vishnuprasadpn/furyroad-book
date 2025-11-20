/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // Main orange from logo
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        fury: {
          orange: '#f97316', // Primary orange from logo
          darkOrange: '#ea580c',
          yellow: '#fbbf24', // Flame yellow from logo
          red: '#ef4444', // Headlight red from logo
          silver: '#e5e7eb', // Metallic silver from logo
          darkGrey: '#374151', // Dark grey from logo
          black: '#000000', // Black background from logo
          grey: '#6b7280', // Medium grey
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'fury': '0 4px 6px -1px rgba(249, 115, 22, 0.1), 0 2px 4px -1px rgba(249, 115, 22, 0.06)',
      },
    },
  },
  plugins: [],
}

