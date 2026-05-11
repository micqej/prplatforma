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
        black: '#0e0e0e',
        white: '#fafaf8',
        accent: '#c8502a',
        'accent-light': '#f5e8e3',
        'gray-100': '#f2f1ee',
        'gray-200': '#e4e2dc',
        'gray-400': '#b0ada4',
        'gray-600': '#7a7770',
        'gray-800': '#3a3834',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        lg: '12px',
      },
    },
  },
  plugins: [],
}

export default config
