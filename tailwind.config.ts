import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1.25rem', sm: '1.5rem', lg: '2rem' },
      screens: { '2xl': '1280px' },
    },
    extend: {
      colors: {
        cream: {
          DEFAULT: '#FBF7F0',
          dark: '#F3EBDD',
          darker: '#E9DDC9',
        },
        ink: {
          DEFAULT: '#2B2118',
          muted: '#6A5B4C',
          soft: '#8A7C6E',
        },
        terracotta: {
          DEFAULT: '#B5452B',
          dark: '#8F3520',
          light: '#D06A50',
        },
        olive: {
          DEFAULT: '#5E6B3A',
          dark: '#49532C',
          light: '#7D8B54',
        },
        gold: {
          DEFAULT: '#C9A227',
          dark: '#A3821A',
          light: '#E0BE4E',
        },
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'Cambria', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(43, 33, 24, 0.04), 0 8px 24px -12px rgba(43, 33, 24, 0.18)',
        lift: '0 2px 4px rgba(43, 33, 24, 0.05), 0 18px 40px -18px rgba(43, 33, 24, 0.28)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      maxWidth: {
        prose: '68ch',
      },
      transitionTimingFunction: {
        entrance: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-down': {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 400ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'slide-down': 'slide-down 260ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'scale-in': 'scale-in 260ms cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
};

export default config;
