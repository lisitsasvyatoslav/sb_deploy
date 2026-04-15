/** @type {import('tailwindcss').Config} */

// Design tokens from Figma (generated: npm run update-tokens)
const {
  colors: figmaColors,
  typography,
  spacing: figmaSpacing,
  borderRadius: figmaBorderRadius,
  opacity: figmaOpacity,
} = require('./tokens');

// Pre-generated CSS variable references for theme auto-switching
const themeTokens = require('./tokens/tailwind-theme');

// black/white need DEFAULT so bare `bg-white` / `text-black` work
const colors = {
  ...figmaColors,
  black: { DEFAULT: '#000000', ...figmaColors.black },
  white: { DEFAULT: '#FFFFFF', ...figmaColors.white },
};

module.exports = {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ============================================================
        // FIGMA THEME — semantic tokens (CSS variables)
        // Automatic switching light/dark: text-blackinverse-a88,
        // bg-status-success, text-mind-brand etc.
        // ============================================================
        ...themeTokens.colors,

        // ============================================================
        // PALETTES FROM FIGMA (Color Base) — static, without theme
        // ============================================================

        // Base colors (with alpha variants)
        black: colors.black,
        white: colors.white,

        // Gray palettes
        gray: colors.gray,
        grey: colors.grey,

        // Color palettes (RGB/* from Figma)
        blue: colors.blue,
        red: colors.red,
        green: colors.green,
        yellow: colors.yellow,
        orange: colors.orange,
        pink: colors.pink,
        cyan: colors.cyan,
        lime: colors.lime,
        brown: colors.brown,

        // Aliases
        brand: { ...colors.blue, ...(themeTokens.colors.brand || {}) },
        primary: colors.blue,
        info: colors.cyan,
        success: colors.green,
        warning: colors.orange,
        danger: colors.red,
        error: colors.red,

        // ============================================================
        // CUSTOM COLORS AND MANUAL OVERRIDES
        // ============================================================

        accent: {
          ...(colors.accent || {}),
          DEFAULT: 'var(--brand-primary, var(--mind-accent))',
          hover: 'var(--brand-primary-hover, var(--mind-accent))',
          active: 'var(--brand-primary-hover, var(--mind-accent))',
        },

        purple: {
          ...colors.purple,
          DEFAULT: colors.purple?.['500'],
          hover: colors.purple?.['600'],
          active: colors.purple?.['700'],
          light: '#BDA5F2',
          lighter: colors.purple?.['50'],
        },

        // Portfolio colors
        portfolio: {
          vtbr: '#8B5CF6',
          lqdt: '#3B82F6',
          gold: '#10B981',
          sber: '#F59E0B',
        },

        // Chart colors (static palette + DS tokens for theme-aware parts)
        chart: {
          gradient: {
            start: '#7B4BDF',
            end: '#7B4BDF',
          },
          stroke: '#7B4BDF',
          grid: '#F0F0F0',
          text: '#121212',
          'tooltip-bg': 'var(--surfacemedium-surfacemedium)',
          'tooltip-text': 'var(--blackinverse-a100)',
          'tooltip-border': 'var(--blackinverse-a12)',
          'axis-text': 'var(--blackinverse-a56)',
          'axis-emphasis': 'var(--blackinverse-a88)',
          positive: 'var(--status-success)',
          negative: 'var(--status-negative)',
          neutral: 'var(--blackinverse-a32)',
        },

        // UI colors - border (CSS variables for theme support)
        border: {
          light: 'var(--border-light)',
          medium: 'var(--border-medium)',
          card: 'var(--border-card)',
        },

        // UI colors - text (CSS variables for theme support)
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          base: 'var(--text-base)',
        },

        // Background: manual + Figma
        background: {
          base: 'var(--bg-base)',
          'auth-page': 'var(--bg-auth-page)',
          card: 'var(--bg-card)',
          hover: 'var(--bg-hover)',
          muted: 'var(--bg-muted)',
          secondary: 'var(--bg-secondary)',
          ...(themeTokens.colors.background || {}),
        },

        // Tag colors (DS tokens)
        tag: {
          bg: '#D7D7D7',
          'entity-bg': 'var(--blackinverse-a6)',
          'signal-bg': 'var(--blue-a12)',
          positive: 'var(--status-success)',
          'positive-bg': 'var(--base-accent_accentsuccessa8)',
          negative: 'var(--status-negative)',
          'negative-bg': 'var(--base-accent_accentdangera8)',
          neutral: 'var(--blackinverse-a56)',
          'neutral-bg': 'var(--blackinverse-a8)',
        },

        // Additional shades
        'gray-light': '#EBEBF2',
        'gray-medium': '#A4A4B2',
        'gray-dark': '#5B616D',
        'gray-darker': '#6E6E6F',
        'gray-text': '#2D3339',

        // Specific colors from the design
        'text-heading': '#242429',
        'text-muted': '#8A8A90',
        'accent-purple': '#8E7CFB',
        'success-brand': '#19B153',

        // Chat-specific colors
        chat: {
          bubble: 'var(--chat-bubble-bg)',
          'bubble-text': 'var(--chat-bubble-text)',
          'placeholder-hover': colors.blue?.['300'],
          'input-bg': 'var(--chat-input-bg)',
        },

        // Icon container colors
        icon: {
          note: '#1C1C1F',
          document: '#1C5C3C',
          link: '#005B94',
        },

        // Sidebar colors
        sidebar: {
          bg: 'var(--sidebar-bg)',
        },

        // Accent hover/active
        'accent-hover': 'var(--accent-hover)',
        'accent-active': 'var(--accent-active)',

        // Surface: manual + Figma (TD-891 split surface into surfacewhite/gray/medium/low)
        surface: {
          ...(themeTokens.colors.surfacewhite || {}),
          ...(themeTokens.colors.surfacegray || {}),
          ...(themeTokens.colors.surfacemedium || {}),
          ...(themeTokens.colors.surfacelow || {}),
          // Manual aliases must come AFTER themeTokens spreads to avoid being overwritten
          low: 'var(--surface-low)',
          medium: 'var(--surface-medium)',
        },

        // Overlay: manual + Figma
        overlay: {
          light: 'var(--overlay-light)',
          medium: 'var(--overlay-medium)',
          ...(themeTokens.colors.overlay || {}),
        },

        // ── Board edge colors (DS tokens) ──
        edge: {
          DEFAULT: 'var(--blackinverse-a32)',
          port: 'var(--mind-accent)',
        },

        // ── Selection colors (DS tokens + color-mix for glows) ──
        selection: {
          primary: 'var(--mind-accent)',
          'primary-glow': 'color-mix(in srgb, var(--mind-accent) 40%, transparent)',
          'primary-glow-light': 'color-mix(in srgb, var(--mind-accent) 20%, transparent)',
          secondary: 'var(--other-cyan)',
          'secondary-glow': 'color-mix(in srgb, var(--other-cyan) 40%, transparent)',
          'secondary-glow-light': 'color-mix(in srgb, var(--other-cyan) 20%, transparent)',
          group: 'var(--blackinverse-a56)',
          'group-fill': 'var(--blackinverse-a8)',
        },

        // ── Skeleton (DS tokens) ──
        skeleton: {
          stroke: 'var(--blackinverse-a8)',
          line: 'var(--blackinverse-a12)',
          shimmer: 'var(--blackinverse-a4)',
        },

        // ── Toast (DS tokens) ──
        toast: {
          success: 'var(--status-success)',
          error: 'var(--status-negative)',
          warning: 'var(--status-warning)',
          info: 'var(--mind-accent)',
        },

        // ── Toggle (DS tokens) ──
        toggle: {
          active: 'var(--mind-accent)',
          inactive: 'var(--blackinverse-a32)',
        },

        // ── Minimap (DS tokens) ──
        minimap: {
          card: 'var(--blackinverse-a56)',
          'trading-idea': 'var(--mind-accent)',
          ai: 'var(--other-cyan)',
          'broker-report': 'var(--status-warning)',
          DEFAULT: 'var(--blackinverse-a32)',
        },

        // ── Semantic color aliases (DS tokens) ──
        'color-accent': 'var(--mind-accent)',
        'color-error': 'var(--base-accent_accentdanger)',
        'color-success': 'var(--status-success)',
        'color-warning': 'var(--status-warning)',
        'color-negative': 'var(--status-negative)',
      },

      // Prose colors (CSS variables for theme switching)
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': 'var(--text-primary)',
            '--tw-prose-headings': 'var(--text-primary)',
            '--tw-prose-bold': 'var(--text-primary)',
            '--tw-prose-links': 'var(--text-accent)',
            '--tw-prose-code': 'var(--text-primary)',
          },
        },
      },

      // ============================================================
      // TYPOGRAPHY from Figma
      // ============================================================
      fontFamily: {
        sans: [typography.fontFamily?.body || 'Inter Variable', 'system-ui', 'sans-serif'],
        display: [typography.fontFamily?.title || typography.fontFamily?.display || 'Inter Variable', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: typography.fontSize?.desktop || {},
      fontWeight: typography.fontWeight || {},
      lineHeight: typography.lineHeight || {},
      letterSpacing: typography.letterSpacing || {},

      // ============================================================
      // SPACING from Figma
      // ============================================================
      spacing: {
        ...figmaSpacing,
        ...themeTokens.spacing,
      },

      // ============================================================
      // BORDER WIDTH from Figma
      // ============================================================
      borderWidth: Object.fromEntries(
        Object.entries(figmaSpacing).filter(([key]) => key.startsWith('border-'))
      ),

      // ============================================================
      // BORDER RADIUS from Figma
      // ============================================================
      borderRadius: {
        ...figmaBorderRadius,
        ...themeTokens.borderRadius,
      },

      // ============================================================
      // OPACITY from Figma (e.g. opacity-statedisabled, opacity-statefocused)
      // ============================================================
      opacity: {
        ...figmaOpacity,
      },

      // ============================================================
      // SHADOWS (custom)
      // ============================================================
      boxShadow: {
        // Figma-generated shadows (CSS variable references)
        ...themeTokens.boxShadow,
        // Manual overrides (kept until migrated to Figma)
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'large': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 2px 10px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 1.6px 6.401px 0 rgba(38, 54, 97, 0.15)',
        'card-dragging': '0 1.6px 16.401px 0 rgba(38, 54, 97, 0.25)',
        'e1': '0px 0px 0.5px 0px rgba(0,0,0,0.18), 0px 1px 2px 0px rgba(0,0,0,0.12)',
        'e3': '0px 0px 0.5px 0px rgba(0,0,0,0.08), 0px 5px 12px 0px rgba(0,0,0,0.18), 0px 1px 3px 0px rgba(0,0,0,0.18)',
        'fab': '0 4px 4px 0 rgba(0, 0, 0, 0.25)',
        'top-nav': '0 0 2px 0 rgba(0, 0, 0, 0.12), 0 2px 5px 0 rgba(0, 0, 0, 0.08)',
        'modal': '0 16px 32px -8px rgba(4, 4, 5, 0.08)',
        'dropdown': '0 0 2px 0 var(--blackinverse-a12), 0 4px 12px 0 var(--blackinverse-a8)',
      },

      backdropBlur: {
        // Figma-generated blur tokens
        ...themeTokens.backdropBlur,
        // Manual overrides
        '40': '40px',
      },
      blur: {
        ...themeTokens.blur,
      },

      // Onboarding glow border + overlay animations
      animation: {
        'glow-spin': 'glow-spin 3s linear infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'overlay-fade-in': 'overlay-fade-in 300ms ease-out forwards',
      },
      keyframes: {
        'glow-spin': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        'overlay-fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
