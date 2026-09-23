import nextPlugin from '@next/eslint-plugin-next'

/**
 * TypeScript source is checked by `tsc --noEmit`.
 * typescript-eslint does not support TypeScript 7 yet, so this config covers
 * JS/MJS config files and Next plugin rules for JS entrypoints only.
 *
 * @type {import('eslint').Linter.Config[]}
 */
const config = [
  {
    ignores: ['.next/**', 'src/generated/**', 'node_modules/**', 'prisma/migrations/**', '**/*.{ts,tsx}']
  },
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    plugins: {
      '@next/next': nextPlugin
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    settings: {
      next: { rootDir: '.' }
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules
    }
  }
]

export default config
