/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: 'class', // manual scheme control — app is dark-themed, avoids media-mode crash
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ink: '#0A0A0B',
        pitch: '#101013',
        card: '#16161A',
        line: '#232329',
        lime: '#22C55E',
        gold: '#F5C518',
        mute: '#8B8B94',
      },
      fontFamily: {
        display: ['System'],
      },
    },
  },
  plugins: [],
};
