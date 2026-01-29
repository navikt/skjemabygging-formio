/// <reference types="vitest" />
import * as path from 'path';
import { defineConfig } from 'vite';

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
});
