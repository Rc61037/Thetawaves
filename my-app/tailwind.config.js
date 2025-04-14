/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'light-pink': '#FFEDF6',
        'dark-pink': '#4B1535',
        'medium-purple': '#9D86D5',
        'grey-purple': '#CAC3E4',
        'shadow-purple': '#554288',
        'shadow-pink': '#D183A9',
      },
      fontFamily: {
        'chango': ['Chango', 'cursive'],
        'nanum': ['Nanum Gothic', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} 