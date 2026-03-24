import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['Manrope', 'sans-serif'],
      },
      colors: {
        sidebar: '#1a1a2e',
        'accent-purple': '#6c63ff',
        'accent-orange': '#f97316',
        'accent-green': '#22c55e',
        'accent-blue': '#3b82f6',
        'accent-red': '#ef4444',
        'accent-teal': '#14b8a6',
      },
    },
  },
  plugins: [],
}

export default config
