/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F3F5F9',
        card: '#FFFFFF',
        ink: '#101B33',
        soft: '#55607A',
        line: '#D6DCE8',
        blue: '#2B4BFF',
        red: '#C8102E',
        green: '#12805C',
        ochre: '#A85F00',
      },
      fontFamily: {
        sans: ['"Atkinson Hyperlegible"', 'system-ui', 'sans-serif'],
        display: ['"Bricolage Grotesque"', '"Atkinson Hyperlegible"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
