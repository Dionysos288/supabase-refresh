const { defineConfig } = require('eslint/config')
const nextPlugin = require('@next/eslint-plugin-next')
const prettierConfig = require('eslint-config-prettier/flat')
const reactPlugin = require('eslint-plugin-react')
const reactHooksPlugin = require('eslint-plugin-react-hooks')
const tseslint = require('@typescript-eslint/eslint-plugin')
const tsparser = require('@typescript-eslint/parser')

module.exports = defineConfig([
  { ignores: ['.next', 'public', 'next-env.d.ts'] },
  reactPlugin.configs.flat.recommended,
  reactHooksPlugin.configs.flat.recommended,
  nextPlugin.flatConfig.coreWebVitals,
  prettierConfig,
  {
    name: 'typescript',
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    settings: {
      react: { version: 'detect' },
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'warn',
    },
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
      'react/jsx-key': 'off',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      // Post-hydration setState is how client-only visuals (canvas sampling,
      // measured layouts) stay SSR-safe; keep it visible but not blocking.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
])
