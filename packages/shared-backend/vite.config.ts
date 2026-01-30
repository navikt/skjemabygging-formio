import * as path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    minify: true,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'shared-backend',
      formats: ['es'],
      fileName: 'index',
    },
  },
  test: {
    globals: true,
    setupFiles: './src/setupTests.ts',
    include: ['src/(**/)?*.test.ts(x)?'],
  },
});
