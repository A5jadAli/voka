// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  {
    ignores: ['.expo/*', 'expo-env.d.ts', 'coverage/*', 'dist/*', 'supabase/functions/**'],
  },
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    rules: {
      eqeqeq: ['error', 'always'],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    files: ['scripts/**/*.{js,cjs,mjs}'],
    rules: {
      'no-console': 'off',
    },
  },
]);
