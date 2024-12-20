/// <reference types="vitest" />
import { defineConfig, PluginOption } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  const plugins: PluginOption = [
    ...VitePluginNode({
      adapter: 'express',
      appPath: './src/server.js',
      outputFormat: 'module',
    }),
  ];

  if (mode !== 'production') {
    // @ts-expect-error dev
    plugins.push(tsconfigPaths());
  }

  return {
    server: {
      port: 8080,
      strictPort: true,
    },
    preview: {
      port: 8080,
      strictPort: true,
    },
    build: {
      rollupOptions: {
        input: './src/server.js',
        output: {
          entryFileNames: '[name].mjs',
        },
      },
    },
    plugins,
    test: {
      globals: true,
      setupFiles: './src/setupTests.ts',
      include: ['src/(**/)?*.test.[jt]s(x)?'],
    },
  };
});
