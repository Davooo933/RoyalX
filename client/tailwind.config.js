/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: '#D4AF37',
        rich: '#0a0a0f',
        velvet: '#1a0f1f',
      },
    },
  },
  plugins: [],
}

