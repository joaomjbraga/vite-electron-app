import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    root: __dirname,
    include: ['__tests__/**/*.test.ts'],
    testTimeout: 1000 * 60,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      thresholds: {
        statements: 70,
        branches: 60,
        functions: 70,
        lines: 70,
      },
      exclude: [
        'node_modules/**',
        'dist/**',
        'template-*/**',
        '__tests__/**',
        '*.config.*',
        'index.js',
        'electron/**',
      ],
    },
  },
})
