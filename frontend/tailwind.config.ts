import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          mocha: '#0B1B3D',
          'mocha-dark': '#071228',
          'mocha-light': '#1A2F5A',
          gold: '#C5A880',
          'gold-light': '#F8F6F0',
          'gold-dark': '#9A7E4F',
          noir: '#0A1128',
          dark: '#0B1B3D',
          cream: '#F8FAFC',
          sand: '#EEF2F7',
          border: '#DCE4ED'
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif']
      },
      boxShadow: {
        luxury: '0 10px 30px -10px rgba(61, 43, 31, 0.08)',
        drawer: '-10px 0 30px rgba(0, 0, 0, 0.15)'
      }
    }
  },
  plugins: []
};

export default config;
