/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#FFF6E5',
          dark: '#EADFCB'
        },
        teal: {
          DEFAULT: '#2C8C99',
          dark: '#23737E'
        },
        ocean: '#CDEBF3',
        text: {
          main: '#2E2A26',
          muted: '#6B625A'
        },
        border: {
          light: '#EADFCB'
        },
        feedback: {
          error: '#C8453B',
          success: '#4C9A5B'
        },
        story: {
          legenda: '#D9663F',
          mite: '#7B5EA7',
          fabel: '#4C9A5B',
          dongeng: '#E3A72F'
        }
      },
      fontFamily: {
        fredoka: ['Fredoka', 'sans-serif'],
        nunito: ['Nunito', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        'pill': '9999px',
      },
      boxShadow: {
        'warm': '0 4px 20px -2px rgba(46, 42, 38, 0.08)',
        'warm-lg': '0 12px 32px -4px rgba(46, 42, 38, 0.12)',
      }
    },
  },
  plugins: [],
}
