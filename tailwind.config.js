/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          500: '#001B79',
          600: '#001866',
          700: '#001454',
          800: '#001042',
          900: '#000c30',
        },
        secondary: {
          50: '#faf7ff',
          100: '#f3ebff',
          500: '#9336B4',
          600: '#7d2d9a',
          700: '#672481',
          800: '#511b68',
          900: '#3b124f',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'slide': 'slide 20s linear infinite',
      },
      keyframes: {
        slide: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        }
      }
    },
  },
  plugins: [],
};