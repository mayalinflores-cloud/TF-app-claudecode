/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0057FF',
          light: '#3D7FFF',
          pale: '#7AABFF',
          dark: '#003DB3',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        brand: '0 10px 30px -10px rgba(0, 87, 255, 0.6)',
      },
    },
  },
  plugins: [],
}
