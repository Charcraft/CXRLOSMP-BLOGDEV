/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        p5: {
          black: '#0D0D0D',
          dark: '#121212',
          darker: '#1A1A1A',
          card: '#1E1E1E',
          red: '#D92323',
          'red-dark': '#B71C1C',
          'red-dim': '#732424',
          gold: '#F2E852',
          'gold-dark': '#F5BD02',
          bronze: '#8C6723',
          grey: '#7B7B7B',
          'grey-light': '#A0A0A0',
          white: '#FFFFFF',
          pink: '#E91E63',
          purple: '#7B1FA2',
        },
        p3: {
          blue: '#00B4FF',
          'dark-blue': '#003D66',
          pink: '#FF6B9D',
          cream: '#FFF8E7',
          purple: '#8B4FCF',
        },
        fusion: {
          bg: '#0A0A0F',
          'bg-secondary': '#12121A',
          card: '#1A1A24',
          'accent-primary': '#D92323',
          'accent-secondary': '#00B4FF',
          'accent-tertiary': '#FF6B9D',
          highlight: '#F2E852',
          'text-primary': '#FFFFFF',
          'text-muted': '#A0A0B0',
        },
      },
      fontFamily: {
        display: ['"Pixelated MS Gothic"', 'monospace'],
        ui: ['"Noto Sans JP"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'fade-slide-up': 'fadeSlideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'gradient-shift': 'gradientShift 4s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'float-slow': 'floatSlow 8s ease-in-out infinite',
        'grain-shift': 'grainShift 0.1s infinite',
        'scanlines': 'scanlines 0.1s infinite',
      },
      keyframes: {
        fadeSlideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', boxShadow: '0 0 20px rgba(217, 35, 35, 0.3)' },
          '50%': { opacity: '1', boxShadow: '0 0 40px rgba(217, 35, 35, 0.6), 0 0 80px rgba(0, 180, 255, 0.3)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '33%': { transform: 'translateY(-15px) rotate(2deg)' },
          '66%': { transform: 'translateY(10px) rotate(-1deg)' },
        },
        grainShift: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '100% 100%' },
        },
        scanlines: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 4px' },
        },
      },
      backgroundImage: {
        'grad-fusion': 'linear-gradient(135deg, #D92323 0%, #00B4FF 100%)',
        'grad-ui': 'linear-gradient(90deg, #FF6B9D 0%, #D92323 50%, #00B4FF 100%)',
        'grad-tokyo': 'linear-gradient(180deg, #0A0A0F 0%, #0D0D1A 50%, #1A0A1A 100%)',
        'grad-red': 'linear-gradient(90deg, #D92323, #E91E63)',
        'grad-gold': 'linear-gradient(90deg, #F2E852, #F5BD02)',
        'grain': 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
      },
      backgroundSize: {
        '200%': '200% 200%',
      },
    },
  },
  plugins: [],
};