import { defineConfig, mergeConfig } from 'vitest/config';
import { createVitestConfig } from '../../vitest-base';
import viteConfig from './vite.config';

export default defineConfig((env) =>
  mergeConfig(
    viteConfig(env),
    createVitestConfig({
      test: {
        setupFiles: './src/setupTests.ts',
      },
    }),
  ),
);
