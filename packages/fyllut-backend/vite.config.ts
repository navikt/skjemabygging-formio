/// <reference types="vitest" />
import { defineConfig, PluginOption } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  const plugins: PluginOption = [
    ...VitePluginNode({
      adapter: 'express',
      appPath: './src/server.js',
    }),
    viteStaticCopy({
      targets: [
        {
          src: './icons/nav-logo.svg', // src folder
          dest: './icons/nav-logo.svg', // Destination folder in `dist`
        },
      ],
    }),
  ];

  if (mode !== 'production') {
    // @ts-expect-error dev
    plugins.push(tsconfigPaths());
  }

  return {
    base: '/fyllut',
    server: {
      port: 8081,
      strictPort: true,
    },
    preview: {
      port: 8081,
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
