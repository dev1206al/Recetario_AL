/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        accent: {
          DEFAULT: '#e8572a',
          hover: '#d44b1e',
          light: '#ff6b3d',
          muted: 'rgba(232,87,42,0.15)',
        },
      },
      screens: {
        xs: '390px',
      },
    },
  },
  plugins: [],
}
