import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

// Standalone test config — the app build uses vite.config.ts (SSG plugin,
// islands, tailwind). Tests only need the sigx JSX transform and the `@` alias.
export default defineConfig({
    oxc: {
        jsx: {
            runtime: 'automatic',
            importSource: 'sigx',
        },
    },
    test: {
        environment: 'node',
        include: ['src/**/__tests__/**/*.test.{ts,tsx}'],
    },
    resolve: {
        alias: {
            '@': resolve(import.meta.dirname, 'src'),
        },
    },
});
