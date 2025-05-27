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
      transitionDuration: {
        2000: '2000ms', // ✅ Support duration-2000
      },
      animation: {
        typing: 'typing 3s steps(5) infinite',
        cursor: 'cursor 1s step-end infinite',
        shine: 'shine 3s linear infinite',
        float: 'float 15s ease-in-out infinite',
        'float-reverse': 'float-reverse 20s ease-in-out infinite',
        pulse: 'pulse 8s ease-in-out infinite',
        'smooth-typing': 'smooth-typing 8s infinite',
        'smooth-cursor': 'smooth-cursor 8s ease-in-out infinite',
      },
      keyframes: {
        'smooth-typing': {
          '0%': { width: '0', opacity: '0' },
          '20%': { width: '100%', opacity: '1' },
          '80%': { width: '100%', opacity: '1' },
          '100%': { width: '0', opacity: '0' }
        },
        'smooth-cursor': {
          '0%, 20%': {
            borderColor: '#c56cf0',
            opacity: '1'
          },
          '21%, 79%': {
            borderColor: 'transparent',
            opacity: '0'
          },
          '80%, 100%': {
            borderColor: '#c56cf0',
            opacity: '1'
          }
        }
      },
    },
  },
  plugins: [],
}
