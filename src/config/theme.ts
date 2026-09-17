import type { MantineThemeOverride } from '@mantine/core'

export const theme: MantineThemeOverride = {
  primaryColor: 'forest',
  primaryShade: 6,
  fontFamily: 'var(--font-inter), sans-serif',
  headings: { fontFamily: 'var(--font-space-grotesk), sans-serif' },
  defaultRadius: 'sm',
  colors: {
    forest: [
      '#edf3ed',
      '#dceadd',
      '#c4dbc6',
      '#a4c6aa',
      '#7cab89',
      '#4d8664',
      '#285342',
      '#214634',
      '#193b2e',
      '#112c20'
    ]
  },
  breakpoints: { xs: '30em', sm: '48em', md: '62em', lg: '75em', xl: '88em' },
  components: {
    Button: { defaultProps: { radius: 'sm' } },
    ActionIcon: { defaultProps: { radius: 'sm' } },
    TextInput: { defaultProps: { size: 'md' } },
    Textarea: { defaultProps: { size: 'md' } }
  }
}
