/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8e44ad',
        'primary-dark': '#6c3483',
        'primary-light': '#a569bd',
        accent: '#c56cf0',
        'accent-glow': 'rgba(197, 108, 240, 0.3)',
        dark: '#121212',
        darker: '#0a0a0a',
        light: '#f5f5f5',
        glass: 'rgba(255, 255, 255, 0.1)',
        'glass-dark': 'rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
}