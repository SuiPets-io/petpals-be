import globals from 'globals';
import pluginJs from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
  // eslintConfigPrettier,
  {
    rules: {
      'no-console': 'off',
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      indent: ['error', 2],
      'linebreak-style': ['error', 'unix'],
      '@typescript-eslint/no-unused-vars': 0,
    },
  },
];
