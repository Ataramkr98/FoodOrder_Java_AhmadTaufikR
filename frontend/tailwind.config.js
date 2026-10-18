/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#FFF6E5',
          100: '#FFE9C2',
          200: '#FFD38A',
          300: '#FFBC52',
          400: '#FFA51A',
          500: '#F97316',  // Primary Orange
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted:   '#F8FAFC',
          card:    '#FFFFFF',
          dark:    '#0F172A',
          'dark-card': '#1E293B',
          'dark-muted': '#334155',
        },
        status: {
          pending:    '#94A3B8',
          confirmed:  '#3B82F6',
          preparing:  '#F59E0B',
          dispatch:   '#8B5CF6',
          delivered:  '#10B981',
          cancelled:  '#EF4444',
        },
      },
      fontFamily: {
        sans: ['"Google Sans"', '"Google Sans Text"', '"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['"Google Sans"', '"Google Sans Text"', '"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 4px 10px -2px rgba(0, 0, 0, 0.03)',
        'float': '0 10px 25px -4px rgba(0, 0, 0, 0.08), 0 4px 10px -2px rgba(0, 0, 0, 0.04)',
        'modal': '0 20px 40px -10px rgba(0, 0, 0, 0.2)',
      },
      animation: {
        'pulse-subtle': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce 2s infinite',
        'spin-slow': 'spin 8s linear infinite',
      }
    },
  },
  plugins: [],
};
