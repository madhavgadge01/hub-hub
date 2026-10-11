/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#000000',
          card: '#080808',
          cardHover: '#0e0e0e',
          border: '#333333',
          borderSubtle: '#222222',
          text: '#ededed',
          muted: '#888888',
          code: '#111111',
        },
        light: {
          bg: '#ffffff',
          card: '#ffffff',
          cardHover: '#f9fafb',
          border: '#eaeaea',
          borderSubtle: '#f0f0f0',
          text: '#000000',
          muted: '#666666',
          code: '#f4f4f5',
        },
        accent: {
          blue: '#0070f3',
          emerald: '#10b981',
          amber: '#f59e0b',
          purple: '#8b5cf6',
          rose: '#f43f5e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow': '0 0 20px -5px rgba(255, 255, 255, 0.1)',
        'glow-blue': '0 0 25px -5px rgba(0, 112, 243, 0.25)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-subtle': 'pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        }
      }
    },
  },
  plugins: [],
}
