import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/**/*.{html,ts}'
  ],
  theme: {
    extend: {
      colors: {
        fritomix: {
          navy: '#071938',
          'navy-light': '#0D2754',
          'navy-hover': '#0F3060',
          red: '#D6001C',
          blue: '#0055FF',
          'blue-dark': '#0044DD',
          'blue-light': '#EBF2FF',
          'gray-bg': '#F8FAFC'
        }
      }
    }
  },
  plugins: []
} satisfies Config;
