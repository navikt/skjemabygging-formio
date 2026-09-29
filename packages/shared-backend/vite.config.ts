import * as path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    ssr: true,
    minify: true,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'shared-backend',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      // Share runtime classes such as ResponseError with the consuming backend.
      external: ['@navikt/skjemadigitalisering-shared-domain'],
    },
  },
});
