import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // NBC + Vaultix Brand Colors
        primary: {
          DEFAULT: '#E4002B', // NBC Red
          50: '#FFE5E9',
          100: '#FFCCD4',
          200: '#FF99A9',
          300: '#FF667E',
          400: '#FF3353',
          500: '#E4002B',
          600: '#B40022',
          700: '#84001A',
          800: '#540011',
          900: '#240008',
          950: '#0F0003',
        },
        ink: {
          DEFAULT: '#0B0C10', // Onyx/Dark
          50: '#F2F2F3',
          100: '#E6E6E7',
          200: '#CCCCCE',
          300: '#B3B3B6',
          400: '#99999D',
          500: '#808085',
          600: '#66666C',
          700: '#4D4D54',
          800: '#33333B',
          900: '#1A1A23',
          950: '#0B0C10',
        },
        slate: {
          DEFAULT: '#374151',
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
          950: '#030712',
        },
        accent: {
          DEFAULT: '#C8A75E', // Vaultix Gold
          50: '#FAF7F1',
          100: '#F5EFE3',
          200: '#EBDFC7',
          300: '#E0CFAB',
          400: '#D6BF8F',
          500: '#C8A75E',
          600: '#B89444',
          700: '#8B7133',
          800: '#5E4D22',
          900: '#312611',
          950: '#191309',
        },
        accent2: {
          DEFAULT: '#0FB5BA', // Vaultix Teal
          50: '#E6F9FA',
          100: '#CCF3F5',
          200: '#99E7EB',
          300: '#66DBE1',
          400: '#33CFD7',
          500: '#0FB5BA',
          600: '#0C9095',
          700: '#096C70',
          800: '#06484A',
          900: '#032425',
          950: '#011213',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          alt: '#F8FAFC',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        glow: '0 0 20px rgba(228, 0, 43, 0.5)',
        'glow-accent': '0 0 20px rgba(200, 167, 94, 0.5)',
        'glow-accent2': '0 0 20px rgba(15, 181, 186, 0.5)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.5)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.5)',
        '3d': '0 10px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)',
        '3d-lg': '0 20px 60px rgba(0, 0, 0, 0.2), 0 8px 24px rgba(0, 0, 0, 0.15)',
        'inner-glow': 'inset 0 0 20px rgba(228, 0, 43, 0.3)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-out': {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        'slide-in-from-top': {
          from: { transform: 'translateY(-100%)' },
          to: { transform: 'translateY(0)' },
        },
        'slide-in-from-bottom': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        'slide-in-from-left': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        'slide-in-from-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.5' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(228, 0, 43, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(228, 0, 43, 0.6)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        'scale-up': {
          '0%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.1)' },
        },
        levitate: {
          '0%, 100%': { transform: 'translateY(0) rotateX(0deg)' },
          '50%': { transform: 'translateY(-15px) rotateX(5deg)' },
        },
        'tilt-left': {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(-5deg)' },
        },
        'tilt-right': {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(5deg)' },
        },
        'slide-up-fade': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-in',
        'fade-out': 'fade-out 0.3s ease-out',
        'slide-in-from-top': 'slide-in-from-top 0.3s ease-out',
        'slide-in-from-bottom': 'slide-in-from-bottom 0.3s ease-out',
        'slide-in-from-left': 'slide-in-from-left 0.3s ease-out',
        'slide-in-from-right': 'slide-in-from-right 0.3s ease-out',
        shimmer: 'shimmer 2s infinite linear',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 3s ease-in-out infinite',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        wiggle: 'wiggle 1s ease-in-out infinite',
        shake: 'shake 0.5s ease-in-out',
        'scale-up': 'scale-up 0.2s ease-out',
        sparkle: 'sparkle 1.5s ease-in-out infinite',
        levitate: 'levitate 3s ease-in-out infinite',
        'tilt-left': 'tilt-left 0.3s ease-out forwards',
        'tilt-right': 'tilt-right 0.3s ease-out forwards',
        'slide-up-fade': 'slide-up-fade 0.5s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
