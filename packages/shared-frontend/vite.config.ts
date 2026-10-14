import react from '@vitejs/plugin-react';
import * as path from 'path';
import { defineConfig, Plugin } from 'vite';

// Library mode extracts CSS to a separate file but never imports it from the entry, so consumers would not load it.
const injectCssImport = (): Plugin => ({
  name: 'inject-css-import',
  apply: 'build',
  enforce: 'post',
  generateBundle(_options, bundle) {
    const cssImports = Object.keys(bundle)
      .filter((fileName) => fileName.endsWith('.css'))
      .map((fileName) => `import './${fileName}';`)
      .join('\n');

    if (!cssImports) {
      return;
    }

    for (const output of Object.values(bundle)) {
      if (output.type === 'chunk' && output.isEntry) {
        output.code = `${cssImports}\n${output.code}`;
      }
    }
  },
});

export default defineConfig({
  build: {
    minify: true,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'shared-frontend',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react-router', '@navikt/aksel-icons', '@navikt/ds-react'],
    },
  },
  plugins: [react(), injectCssImport()],
});
