import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules', 'build'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html'],
      reportOnFailure: true,
      include: ['src/engine/**', 'src/utils/reports/**'],
      exclude: ['node_modules/', 'tests/', 'build/', '**/*.d.ts', '**/*.config.{js,ts}'],
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': '/src',
      '@engine': '/src/engine',
    },
  },
});
