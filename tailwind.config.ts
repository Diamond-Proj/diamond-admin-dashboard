/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './constants/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}'
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        // Add the new color palette
        baby_powder: {
          DEFAULT: '#fbfef9',
          100: '#2b560f',
          200: '#57ad1d',
          300: '#89e14e',
          400: '#c2f0a4',
          500: '#fbfef9',
          600: '#fdfefc',
          700: '#fdfffc',
          800: '#fefffd',
          900: '#fefffe'
        },
        raisin_black: {
          DEFAULT: '#191923',
          100: '#050507',
          200: '#0a0a0e',
          300: '#0f0f15',
          400: '#14141d',
          500: '#191923',
          600: '#3f3f58',
          700: '#64648d',
          800: '#9696b4',
          900: '#cacada'
        },
        honolulu_blue: {
          DEFAULT: 'hsl(var(--honolulu-blue))',
          100: '#031824',
          200: '#063148',
          300: '#09496c',
          400: '#0c618f',
          500: '#0e79b2',
          600: '#15a1ec',
          700: '#50b8f1',
          800: '#8ad0f6',
          900: '#c5e7fa'
        },
        rose_red: {
          DEFAULT: 'hsl(var(--rose-red))',
          100: '#260414',
          200: '#4c0828',
          300: '#720b3b',
          400: '#980f4f',
          500: '#bf1363',
          600: '#e92480',
          700: '#ef5ba0',
          800: '#f491c0',
          900: '#fac8df'
        },
        carrot_orange: {
          DEFAULT: '#f39237',
          100: '#381d03',
          200: '#703907',
          300: '#a8560a',
          400: '#e0730d',
          500: '#f39237',
          600: '#f6a75d',
          700: '#f8bd86',
          800: '#fad3ae',
          900: '#fde9d7'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
};
