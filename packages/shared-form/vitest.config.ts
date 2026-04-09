import { defineConfig, mergeConfig } from 'vitest/config';
import { createVitestConfig } from '../../vitest-base';
import viteConfig from './vite.config';

export default defineConfig(() =>
  mergeConfig(
    viteConfig,
    createVitestConfig({
      test: {
        environment: 'jsdom',
        setupFiles: './src/setupTests.ts',
      },
    }),
  ),
);
