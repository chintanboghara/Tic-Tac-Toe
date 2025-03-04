// Import necessary ESLint modules and plugins
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

/**
 * ESLint configuration for a TypeScript React project.
 *
 * This configuration:
 * - Ignores the "dist" folder.
 * - Extends recommended settings from @eslint/js and typescript-eslint.
 * - Applies to all TypeScript and TSX files.
 * - Sets ECMAScript 2020 as the language version and browser globals.
 * - Includes plugins for React Hooks and React Refresh.
 * - Enforces recommended React Hooks rules and a warning for non-component exports in React Refresh.
 */
export default tseslint.config(
  { ignores: ['dist'] },
  {
    // Extend base configurations
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    // Apply configuration only to TypeScript files
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // Spread the recommended React Hooks rules
      ...reactHooks.configs.recommended.rules,
      // Custom rule for react-refresh: warn when non-component exports are used
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  }
);
