/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Modern Professional Color Palette
        'primary-bg': '#0F0F23',
        'secondary-bg': '#1A1A2E',
        'primary-text': '#FFFFFF',
        'secondary-text': '#B8BCC8',
        'accent': '#6366F1',
        brand: {
          'primary-bg': '#0F0F23',      // Deep navy
          'secondary-bg': '#1A1A2E',    // Darker navy
          'tertiary-bg': '#16213E',     // Medium navy
          'surface-bg': '#0E1428',      // Card background
          'primary-text': '#FFFFFF',    // Pure white
          'secondary-text': '#B8BCC8',  // Light gray
          'muted-text': '#6B7280',      // Medium gray
          'accent': '#6366F1',          // Modern indigo
          'accent-light': '#818CF8',    // Light indigo
          'accent-dark': '#4F46E5',     // Dark indigo
          'success': '#10B981',         // Emerald
          'warning': '#F59E0B',         // Amber
          'error': '#EF4444',           // Red
        },
        // Admin-specific colors
        admin: {
          'bg': '#F9FAFB',              // Light gray background
          'surface': '#FFFFFF',         // White surface
          'border': '#E5E7EB',          // Light border
          'text-primary': '#111827',    // Dark text
          'text-secondary': '#6B7280',  // Medium gray text
          'text-muted': '#9CA3AF',      // Light gray text
          'sidebar-bg': '#FFFFFF',      // White sidebar
          'sidebar-active': '#EFF6FF',  // Light blue active
          'sidebar-text': '#374151',    // Dark sidebar text
          'sidebar-active-text': '#1D4ED8', // Blue active text
          'accent': '#3B82F6',          // Blue accent
          'accent-hover': '#2563EB',    // Darker blue
          'success': '#059669',         // Green
          'warning': '#D97706',         // Orange
          'error': '#DC2626',           // Red
        },
        surface: {
          DEFAULT: '#1A1A2E',
          elevated: '#16213E',
          card: '#0E1428',
          overlay: 'rgba(15, 15, 35, 0.9)',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-2xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'display-md': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'display-sm': ['1.875rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'heading-lg': ['1.5rem', { lineHeight: '1.4', letterSpacing: '0' }],
        'heading-md': ['1.25rem', { lineHeight: '1.4', letterSpacing: '0' }],
        'heading-sm': ['1.125rem', { lineHeight: '1.5', letterSpacing: '0' }],
        'body-lg': ['1.125rem', { lineHeight: '1.7', letterSpacing: '0' }],
        'body-md': ['1rem', { lineHeight: '1.7', letterSpacing: '0' }],
        'body-sm': ['0.875rem', { lineHeight: '1.6', letterSpacing: '0' }],
        'caption': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],
      },
      spacing: {
        '0': '0',
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '7': '1.75rem',
        '8': '2rem',
        '9': '2.25rem',
        '10': '2.5rem',
        '11': '2.75rem',
        '12': '3rem',
        '14': '3.5rem',
        '16': '4rem',
        '18': '4.5rem',
        '20': '5rem',
        '24': '6rem',
        '28': '7rem',
        '32': '8rem',
        '36': '9rem',
        '40': '10rem',
        '44': '11rem',
        '48': '12rem',
        'generous': '2rem',
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.4)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
        'premium': '0 4px 6px -1px rgba(99, 102, 241, 0.3), 0 10px 20px -3px rgba(15, 15, 35, 0.4), 0 20px 40px -4px rgba(15, 15, 35, 0.3)',
        'card': '0 2px 4px rgba(0, 0, 0, 0.2), 0 8px 16px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 4px 8px rgba(0, 0, 0, 0.3), 0 16px 32px rgba(0, 0, 0, 0.4)',
        'button': '0 2px 4px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.2)',
        'button-hover': '0 4px 8px rgba(0, 0, 0, 0.4), 0 8px 16px rgba(0, 0, 0, 0.3)',
        'glow': '0 0 20px rgba(99, 102, 241, 0.4)',
        'glow-lg': '0 0 40px rgba(99, 102, 241, 0.5)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)',
        'none': 'none',
      },
      borderRadius: {
        'none': '0',
        'sm': '0.25rem',
        'DEFAULT': '0.5rem',
        'md': '0.75rem',
        'lg': '1rem',
        'xl': '1.5rem',
        '2xl': '2rem',
        'full': '9999px',
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
        '600': '600ms',
        '700': '700ms',
      },
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'smooth': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        'bounce-subtle': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'ease-out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideLeft: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        scaleOut: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.95)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-out': 'fadeOut 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'slide-down': 'slideDown 0.6s ease-out forwards',
        'slide-left': 'slideLeft 0.6s ease-out forwards',
        'slide-right': 'slideRight 0.6s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'scale-out': 'scaleOut 0.3s ease-out forwards',
        'shimmer': 'shimmer 2s infinite linear',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce': 'bounce 1s infinite',
        'spin': 'spin 1s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-premium': 'linear-gradient(135deg, var(--tw-gradient-stops))',
        'gradient-subtle': 'linear-gradient(180deg, #0F0F23 0%, #1A1A2E 100%)',
        'gradient-hero': 'linear-gradient(135deg, #0F0F23 0%, #1A1A2E 50%, #16213E 100%)',
        'gradient-hero-radial': 'radial-gradient(ellipse at 30% 20%, rgba(99, 102, 241, 0.12) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(99, 102, 241, 0.08) 0%, transparent 50%), linear-gradient(180deg, #0F0F23 0%, #1A1A2E 100%)',
        'gradient-card': 'linear-gradient(180deg, rgba(22,33,62,0) 0%, rgba(22,33,62,0.8) 100%)',
        'gradient-overlay': 'linear-gradient(180deg, rgba(15,15,35,0) 0%, rgba(15,15,35,0.8) 100%)',
        'gradient-accent': 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
        'gradient-premium-subtle': 'linear-gradient(180deg, #0F0F23 0%, #1A1A2E 100%)',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '40px',
        '3xl': '64px',
      },
    },
  },
  plugins: [
    // Note: @tailwindcss/line-clamp is included by default in Tailwind CSS v3.3+
    function({ addUtilities }) {
      const newUtilities = {
        '.text-premium-caption': {
          fontSize: '0.75rem',
          lineHeight: '1.5',
          letterSpacing: '0.01em',
          fontWeight: '500',
          fontFamily: 'Inter, system-ui, sans-serif',
        },
        '.shadow-glow': {
          boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
        },
        '.shadow-glow-lg': {
          boxShadow: '0 0 40px rgba(99, 102, 241, 0.5)',
        },
        '.shadow-button': {
          boxShadow: '0 2px 4px rgba(15, 15, 35, 0.4), 0 4px 8px rgba(15, 15, 35, 0.3)',
        },
        '.shadow-premium': {
          boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.3), 0 10px 20px -3px rgba(15, 15, 35, 0.4), 0 20px 40px -4px rgba(15, 15, 35, 0.3)',
        },
        '.shadow-card': {
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2), 0 8px 16px rgba(0, 0, 0, 0.3)',
        },
        '.shadow-card-hover': {
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3), 0 16px 32px rgba(0, 0, 0, 0.4)',
        },
        '.bg-gradient-hero-radial': {
          background: 'radial-gradient(ellipse at 30% 20%, rgba(99, 102, 241, 0.12) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(99, 102, 241, 0.08) 0%, transparent 50%), linear-gradient(180deg, #0F0F23 0%, #1A1A2E 100%)',
        },
        '.bg-gradient-premium-subtle': {
          background: 'linear-gradient(180deg, #0F0F23 0%, #1A1A2E 100%)',
        },
        '.bg-gradient-premium-radial-top': {
          background: 'radial-gradient(ellipse at top, #16213E 0%, #0F0F23 70%)',
        },
        '.glass': {
          background: 'rgba(26, 26, 46, 0.7)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        },
        '.ease-smooth': {
          transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        },
        '.ease-premium': {
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        },
        '.border-subtle': {
          border: '1px solid rgba(255, 255, 255, 0.05)',
        },
        '.section-spacing': {
          paddingTop: '4rem',
          paddingBottom: '4rem',
          '@media (min-width: 640px)': {
            paddingTop: '5rem',
            paddingBottom: '5rem',
          },
          '@media (min-width: 1024px)': {
            paddingTop: '6rem',
            paddingBottom: '6rem',
          },
        },
        '.container-premium': {
          width: '100%',
          maxWidth: '80rem',
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: '1rem',
          paddingRight: '1rem',
          '@media (min-width: 640px)': {
            paddingLeft: '1.5rem',
            paddingRight: '1.5rem',
          },
          '@media (min-width: 1024px)': {
            paddingLeft: '2rem',
            paddingRight: '2rem',
          },
        },
      }
      addUtilities(newUtilities)
    }
  ],
}
