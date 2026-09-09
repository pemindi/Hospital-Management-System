/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF6F5',
          100: '#D9EDEA',
          200: '#B3DBD4',
          300: '#8FC9C2',
          400: '#4E9F96',
          500: '#2F8F86',
          600: '#1F6F68',
          700: '#155852',
          800: '#0F423E',
          900: '#0B3330',
        },
        ink: '#1B2430',
        paper: '#F5F6F3',
        line: '#E2E5E1',
        success: { 50: '#EEF6F0', 500: '#3F8F5F', 700: '#2E6B46' },
        warning: { 50: '#FBF3E7', 500: '#C98A2B', 700: '#96671F' },
        danger: { 50: '#F8ECE8', 500: '#B5472E', 700: '#873420' },
      },
      fontFamily: {
        heading: ['Manrope', 'sans-serif'],
        body: ['IBM Plex Sans', 'sans-serif'],
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '10px',
      },
    },
  },
  plugins: [],
}