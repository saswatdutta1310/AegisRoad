/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Barlow Condensed'", 'sans-serif'],
        sans: ["'Inter'", 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ["'JetBrains Mono'", 'ui-monospace', 'monospace'],
      },
      colors: {
        teal: {
          DEFAULT: '#0B4438',
          dark: '#072E24',
          mid: '#156B52',
          light: '#1E7A5F',
        },
        brand: {
          yellow: '#C8D400',
          cream: '#F4F0E6',
          'cream-dark': '#EAE5D6',
        },
      },
    },
  },
  plugins: [],
}
