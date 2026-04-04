import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    root: __dirname,
    include: ['__tests__/**/*.test.ts'],
    testTimeout: 1000 * 60,
    environment: 'node',
  },
})
