const { FlatCompat } = require('@eslint/eslintrc');
const path = require('path');

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/dist/**',
      '**/build/**',
      '**/*.min.js',
      '**/workbox-*',
      '**/sw.js',
      '**/next.config.js',
    ],
    // Disable reporting of unused eslint-disable directives
    linterOptions: {
      reportUnusedDisableDirectives: false,
    },
  },
  ...compat.extends('next', 'next/core-web-vitals'),
  {
    rules: {
      indent: ['error', 2],
      'react/react-in-jsx-scope': 'off',
      'import/no-anonymous-default-export': 'off',
      '@next/next/no-img-element': 'off',
    },
  },
];

module.exports = eslintConfig;

