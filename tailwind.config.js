/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0a0a0f',
        'bg-secondary': '#1a1a2e',
        'bg-card': '#1e1e32',
        'bg-card-hover': '#252540',
        'border-default': '#2d2d44',
        'border-hover': '#3d3d5c',
        'primary': '#6366f1',
        'primary-hover': '#7c7ff2',
        'secondary': '#8b5cf6',
        'accent': '#06b6d4',
        'success': '#22c55e',
        'warning': '#eab308',
        'error': '#ef4444',
        'attention': '#fbbf24',
        'text-primary': '#e2e8f0',
        'text-muted': '#94a3b8',
        'text-dim': '#64748b',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Space Grotesk', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'blink': 'blink 1s step-end infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-attention': 'pulse-attention 2s ease-in-out infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px currentColor' },
          '100%': { boxShadow: '0 0 20px currentColor' },
        },
        'pulse-attention': {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 20px rgba(251,191,36,0.5)' },
          '50%': { transform: 'scale(1.05)', boxShadow: '0 0 40px rgba(251,191,36,0.8)' },
        },
      },
    },
  },
  plugins: [],
}
