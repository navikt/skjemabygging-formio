/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import { readFileSync } from 'fs';
import lodashTemplate from 'lodash/template';
import { defineConfig, loadEnv, PluginOption } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, 'env');

  const plugins: PluginOption = [
    react(),
    createHtmlPlugin({
      minify: true,
      inject: {
        data: {
          ...env,
          VITE_GIT_VERSION: env.VITE_GIT_VERSION ?? '',
          VITE_GIT_BRANCH: env.VITE_GIT_BRANCH ?? '',
        },
      },
    }),
    {
      name: 'formio-template-handler',
      enforce: 'pre',
      config() {},
      load(id: string) {
        if (!id.endsWith('.ejs')) {
          return null;
        }

        const code = readFileSync(id).toString('utf-8');
        // Use same values in Formio.Utils.Evaluator.templateSettings
        const template = lodashTemplate(code, {
          variable: 'ctx',
          evaluate: /\{%([\s\S]+?)%}/g,
          interpolate: /\{\{([\s\S]+?)}}/g,
          escape: /\{\{\{([\s\S]+?)}}}/g,
        });

        return `export default ${template};`;
      },
    },
  ];

  if (mode !== 'production') {
    plugins.push(tsconfigPaths());
  }

  return {
    base: '/fyllut',
    server: {
      open: false,
      port: 3001,
      strictPort: true,
      proxy: {
        '/fyllut/api': {
          target: 'http://localhost:8081',
          changeOrigin: true,
        },
      },
    },
    preview: {
      port: 3001,
      strictPort: true,
    },
    resolve: {
      dedupe: ['react-router', '@navikt/ds-react', '@navikt/ds-icons'],
    },
    plugins,
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
      include: ['src/(**/)?*.test.[jt]s(x)?'],
    },
  };
});
