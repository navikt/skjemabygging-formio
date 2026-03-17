import { mergeConfig } from 'vitest/config';
import { createVitestConfig } from '../../vitest-base';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  createVitestConfig({
    test: {
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
    },
  }),
);
