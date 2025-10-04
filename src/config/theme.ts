import { MantineThemeOverride } from '@mantine/core'

export const theme: MantineThemeOverride = {
  primaryColor: 'blue',
  primaryShade: 6,
  fontFamily: 'Inter, sans-serif',
  fontFamilyMonospace: 'Monaco, Courier, monospace',

  headings: {
    fontFamily: 'Space Grotesk, sans-serif'
  },

  defaultRadius: 'lg',

  colors: {
    blue: [
      '#dbeafe',
      '#bfdbfe',
      '#93c5fd',
      '#60a5fa',
      '#3b82f6',
      '#2563eb',
      '#1d4ed8',
      '#1e40af',
      '#1e3a8a',
      '#172554'
    ],
    violet: [
      '#f3e8ff',
      '#e9d5ff',
      '#d8b4fe',
      '#c084fc',
      '#a855f7',
      '#9333ea',
      '#7c3aed',
      '#6b21a8',
      '#581c87',
      '#3b0764'
    ],
    teal: ['#f0fdfa', '#ccfbf1', '#99f6e4', '#5eead4', '#2dd4bf', '#14b8a6', '#0d9488', '#0f766e', '#115e59', '#134e4a']
  },

  breakpoints: {
    xs: '30em',
    sm: '48em',
    md: '64em',
    lg: '74em',
    xl: '90em'
  },

  components: {
    Button: {
      defaultProps: {
        variant: 'gradient'
      }
    },
    ActionIcon: {
      defaultProps: {
        variant: 'gradient'
      }
    }
  },

  defaultGradient: { from: 'var(--primary)', to: 'var(--secondary)', deg: 135 }
}
