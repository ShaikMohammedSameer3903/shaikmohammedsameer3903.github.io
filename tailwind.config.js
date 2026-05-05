/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'mono': ['Fira Code', 'Courier New', 'monospace'],
      },
      colors: {
        // Premium Color System - Warm Brown Theme
        'primary': '#bf8140',      // Main warm brown/orange
        'primaryDark': '#a86f36',  // Darker shade for hover
        'primaryLight': '#d69a5c', // Lighter shade for gradients
        'secondary': '#10B981',    // Emerald Green (kept for success states)
        'accent': '#0EA5E9',        // Sky Blue (kept for info states)
        
        // Background Colors
        'bg': '#f9fafb',           // Light neutral sections
        'bg-warm': '#fef9f5',      // Very light warm tint
        'surface': '#ffffff',      // White cards
        'surface-secondary': '#f9fafb',
        'surface-tertiary': '#f3f4f6',
        
        // Text Colors - High Contrast
        'text': '#1f2937',         // Primary text
        'text-secondary': '#6b7280',
        'text-muted': '#9ca3af',
        'text-light': '#d1d5db',
        
        // Semantic Colors
        'success': '#10B981',      
        'error': '#EF4444',        
        'warning': '#F59E0B',      
        'info': '#3B82F6',         
        
        // Border Colors
        'border': '#e5e7eb',
        'border-light': '#f3f4f6',
        'border-dark': '#d1d5db',
        
        // Dark Theme for Sidebar
        'dark-bg': '#1f2937',      // Dark sidebar background
        'dark-surface': '#374151',  // Dark surface
        'dark-border': '#4b5563',   // Dark borders
        'dark-text': '#f9fafb',     // Light text on dark
        'dark-text-secondary': '#d1d5db',
      },
      boxShadow: {
        'premium': '0 4px 6px -1px rgba(191, 129, 64, 0.15), 0 2px 4px -1px rgba(191, 129, 64, 0.1)',
        'premium-lg': '0 10px 15px -3px rgba(191, 129, 64, 0.15), 0 4px 6px -2px rgba(191, 129, 64, 0.1)',
        'soft': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'soft-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'warm': '0 4px 6px -1px rgba(191, 129, 64, 0.2), 0 2px 4px -1px rgba(191, 129, 64, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'slide-up-delay-100': 'slideUp 0.3s ease-out 0.1s both',
        'slide-up-delay-200': 'slideUp 0.3s ease-out 0.2s both',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'skeleton': 'skeleton 1.5s ease-in-out infinite',
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
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        skeleton: {
          '0%': { opacity: '0.4' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.4' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
