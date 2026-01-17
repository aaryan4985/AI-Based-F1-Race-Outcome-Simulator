/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        f1: {
          red: '#e10600',
          dark: '#15151e',
          gray: '#38383f',
        }
      }
    },
  },
  plugins: [],
}
