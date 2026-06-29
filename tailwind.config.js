/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream:  '#F7F1E8',
        light:  '#FDF9F3',
        border: '#E8DDD0',
        muted:  '#8A7060',
        brown:  '#9B6A45',
        orange: '#E96B3C',
        green:  '#7A8B5C',
        yellow: '#F3C766',
        ink:    '#24211E',
      },
      fontFamily: {
        serif: ['Instrument Serif', 'Georgia', 'serif'],
        sans:  ['Manrope', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '14px',
        sm: '8px',
        lg: '20px',
        xl: '24px',
        full: '9999px',
      },
    },
  },
  plugins: [],
}
