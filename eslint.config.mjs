import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

// Mục tiêu chính: bắt biến chưa khai báo (no-undef) sau khi tách component
export default [
  { ignores: ['dist/**', 'node_modules/**', 'data/**', 'public/**'] },
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, firebase: 'readonly', module: 'readonly', require: 'readonly', define: 'readonly' }
    },
    plugins: { react, 'react-hooks': reactHooks },
    settings: { react: { version: '18.3' } },
    rules: {
      ...js.configs.recommended.rules,
      'react/jsx-uses-vars': 'error',
      'react/jsx-uses-react': 'error',
      'react/jsx-no-undef': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'no-unused-vars': 'off',
      'no-empty': 'off',
      'no-useless-escape': 'off'
    }
  }
];
