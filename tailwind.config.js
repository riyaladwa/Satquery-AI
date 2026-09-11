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
        // Minimal White + Green Palette
        brand: {
          bg: '#FFFFFF',
          surface: '#FBFDFB',
          card: '#FFFFFF',
          border: '#E3EAE5',
          borderHover: '#CBD8D0',
          text: '#17201B',
          textSecondary: '#66736B',
          slate: '#66736B',
          muted: '#8A9990',
          textMuted: '#66736B',
          textSubtle: '#8A9990',
          green: '#167A4A',          // Primary green
          greenHover: '#13673E',     // Darker green for hover
          greenSecondary: '#2E9B68', // Secondary green
          greenDark: '#115C38',
          greenLight: '#EAF7F0',     // Very light green
          greenSubtle: '#F4FAF6',
          greenAccent: '#2E9B68',
          danger: '#DC2626',
          warning: '#D97706'
        },
        // Re-mapped gis tokens to light theme
        gis: {
          bg: '#FFFFFF',
          bgAlt: '#F8FAFC',
          surface: '#F1F5F9',
          panel: '#FFFFFF',
          panelHover: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
          borderSubtle: '#F1F5F9',
          hover: '#F0FDF4',
          accent: '#15803D',      // Deep green
          accentTeal: '#10B981',
          accentBlue: '#0284C7',
          textBright: '#0F172A',  // Dark charcoal text
          textMuted: '#64748B',   // Slate secondary text
          warning: '#D97706',
          danger: '#DC2626',
          success: '#15803D',
          sar: '#15803D',
          optical: '#10B981',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
        'dropdown': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
