import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        '**/node_modules/**',
        '**/convex/_generated/**',
        '**/*.config.ts',
        '**/test-notifications.ts',
      ],
      include: ['convex/**/*.ts'],
    },
    include: ['**/*.{test,spec}.ts'],
    exclude: ['**/node_modules/**', '**/convex/_generated/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './convex'),
    },
  },
})
