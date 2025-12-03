import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // DJI 品牌色彩系统
        'dji-red': '#D00000',
        'dji-red-light': '#FFECEC',
        'dji-red-dark': '#B00000',
        'tech-gray': '#1A1A1A',
        'tech-gray-light': '#F5F7F9',
        'tech-gray-medium': '#E8EBF0',
        'tech-orange': '#FF8C00',
        'tech-white': '#FFFFFF',
        'tech-border': '#EEEEEE',
        'tech-text': '#333333',
        'tech-text-light': '#666666',
        'tech-text-ai': '#222222',
      },
      fontFamily: {
        'source-han': ['Source Han Sans CN', 'Noto Sans CJK SC', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'drone-spin': 'droneSpin 1.5s linear infinite',
        'bubble-pop': 'bubblePop 0.3s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        droneSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        bubblePop: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      maxWidth: {
        '8xl': '88rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'tech': '0 2px 8px rgba(26, 26, 26, 0.1)',
        'tech-hover': '0 4px 16px rgba(208, 0, 0, 0.15)',
        'message': '0 1px 3px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}

export default config