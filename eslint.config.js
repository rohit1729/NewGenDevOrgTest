import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [
  // Ignore patterns first
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      '.next/',
      '**/*.d.ts',
    ],
  },
  
  // Base configuration for all TypeScript/JavaScript files
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
    },
    rules: {
      ...js.configs.recommended.rules,
      // Shared rules for both apps
      'no-console': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  
  // Node.js API specific configuration
  {
    files: ['apps/api/**/*.{js,ts}'],
    languageOptions: {
      globals: {
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        console: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        global: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
      },
    },
    rules: {
      'no-console': 'off', // Allow console in backend
    },
  },
  
  // Next.js web app specific configuration
  {
    files: ['apps/web/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        prompt: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        // Browser types
        HTMLElement: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLButtonElement: 'readonly',
        HTMLInputElement: 'readonly',
        Node: 'readonly',
        MouseEvent: 'readonly',
        KeyboardEvent: 'readonly',
        Event: 'readonly',
        EventTarget: 'readonly',
        FormData: 'readonly',
        Headers: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        RequestInit: 'readonly',
        URLSearchParams: 'readonly',
        // React globals
        React: 'readonly',
        JSX: 'readonly',
        // Next.js/Node.js globals for web
        process: 'readonly',
      },
    },
    rules: {
      'no-console': 'warn', // Warn about console in frontend
    },
  },
];