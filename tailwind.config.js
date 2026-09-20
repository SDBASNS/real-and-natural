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
        forest: {
          DEFAULT: '#173B2A',
          dark: '#0F2A1D',
          light: '#25543D',
        },
        gold: {
          DEFAULT: '#C49A4A',
          hover: '#A87F30',
          light: '#DFBA6D',
        },
        cream: {
          DEFAULT: '#F7F1E5',
          dark: '#EFE6D2',
          light: '#FCF9F3',
        },
        earth: {
          DEFAULT: '#6B4432',
          light: '#8D5B43',
        },
        brandGreen: '#25D366',
      },
      fontFamily: {
        'serif-display': ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          lg: '2rem',
          xl: '2.5rem',
        },
      },
    },
  },
  plugins: [],
};
