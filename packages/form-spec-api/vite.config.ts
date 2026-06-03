import { defineConfig, PluginOption } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  const plugins: PluginOption = [
    ...VitePluginNode({
      adapter: 'express',
      appPath: './src/server.ts',
      outputFormat: 'module',
    }),
  ];

  if (mode !== 'production') {
    // @ts-expect-error dev
    plugins.push(tsconfigPaths());
  }

  return {
    server: {
      port: 8082,
      strictPort: true,
    },
    preview: {
      port: 8082,
      strictPort: true,
    },
    build: {
      target: 'es2022',
      rollupOptions: {
        input: './src/server.ts',
        output: {
          entryFileNames: '[name].mjs',
        },
      },
    },
    esbuild: {
      target: 'es2022',
    },
    plugins,
  };
});
