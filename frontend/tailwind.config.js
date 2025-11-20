/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        tealgrey: {
          700: '#2f3e46',
          600: '#354f52',
          500: '#52796f',
          400: '#84a98c',
        },
      },
    },
  },
  plugins: [],
}
