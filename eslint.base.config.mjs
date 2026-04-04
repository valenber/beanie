import tseslint from 'typescript-eslint';

/**
 * Base ESLint config for the monorepo.
 * Apps should import and extend this with framework-specific rules.
 */
export const baseConfig = tseslint.config(
  { ignores: ['**/dist/**', '**/node_modules/**'] },
  ...tseslint.configs.recommended,
);
