/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        abyssal: '#0F1A2E',
        midnight: '#1A1040',
        strata: '#5448A0',
        layer: '#9B8FE4',
        mist: '#E8DFF5',
        emerald: '#1B7A5F',
        amber: '#C87A2F',
        crimson: '#B03040',
        sapphire: '#2B6CB0',
        canvas: '#F7F4FC',
      },
      fontFamily: {
        sans: ['Raleway', 'Century Gothic', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
