import react from '@vitejs/plugin-react';
import { defineConfig, PluginOption } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import tsconfigPaths from 'vite-tsconfig-paths';

const backendPort =
  process.env.BACKEND_PORT ?? process.argv.find((a) => a.startsWith('--backend-port='))?.split('=')[1] ?? '8083';

export default defineConfig(({ mode }) => {
  const plugins: PluginOption = [react(), createHtmlPlugin({ minify: true })];

  if (mode !== 'production') {
    plugins.push(tsconfigPaths());
  }

  return {
    base: '/sendinn',
    server: {
      open: false,
      port: 3003,
      strictPort: true,
      proxy: {
        '/sendinn/api': {
          target: `http://localhost:${backendPort}`,
          changeOrigin: true,
        },
      },
    },
    preview: {
      port: 3003,
      strictPort: true,
    },
    resolve: {
      dedupe: ['react-router', '@navikt/ds-react', '@navikt/aksel-icons'],
    },
    plugins,
  };
});
