export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: '#101114',
        paper: '#f5f3ef',
        pixel: '#52d273',
        brand: '#38bdf8',
      },
      boxShadow: {
        soft: '0 18px 55px rgba(0,0,0,.18)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
