import * as path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  ssr: {
    // Add libraries that should not be bundled for the browser
    external: ['jsdom'],
  },
  build: {
    minify: true,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'shared-domain',
      formats: ['es'],
      fileName: 'index',
    },
  },
  test: {
    globals: true,
    setupFiles: './src/setupTests.ts',
    include: ['src/(**/)?*.test.[jt]s(x)?'],
  },
});
