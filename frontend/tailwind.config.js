/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#050505',
        foreground: '#FAFAFA',
        glass: {
          surface: 'rgba(255,255,255,0.03)',
          hover:   'rgba(255,255,255,0.06)',
          active:  'rgba(255,255,255,0.09)',
          border:  'rgba(255,255,255,0.08)',
          highlight: 'rgba(255,255,255,0.15)',
        },
        monochrome: {
          50:  '#FAFAFA',
          100: '#F4F4F5',
          300: '#D4D4D8',
          500: '#71717A',
          800: '#27272A',
          900: '#18181B',
          950: '#09090B',
        },
      },
      fontFamily: {
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      backdropBlur: {
        apple:  '32px',
        subtle: '16px',
      },
      boxShadow: {
        glass: '0 20px 50px rgba(0,0,0,0.6), inset 0 1px 0 0 rgba(255,255,255,0.1)',
        glow:  '0 0 25px rgba(255,255,255,0.08)',
        'glow-sm': '0 0 12px rgba(255,255,255,0.06)',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
      },
    },
  },
  plugins: [],
}
