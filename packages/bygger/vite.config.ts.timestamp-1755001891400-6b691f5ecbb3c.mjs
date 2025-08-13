// vite.config.ts
import react from 'file:///Users/nav/Documents/dev/skjemabygging-formio/node_modules/@vitejs/plugin-react/dist/index.mjs';
import lodashTemplate from 'file:///Users/nav/Documents/dev/skjemabygging-formio/node_modules/lodash/template.js';
import { createHtmlPlugin } from 'file:///Users/nav/Documents/dev/skjemabygging-formio/node_modules/vite-plugin-html/dist/index.mjs';
import tsconfigPaths from 'file:///Users/nav/Documents/dev/skjemabygging-formio/node_modules/vite-tsconfig-paths/dist/index.js';
import {
  defineConfig,
  loadEnv,
} from 'file:///Users/nav/Documents/dev/skjemabygging-formio/node_modules/vite/dist/node/index.js';
import { readFileSync } from 'fs';
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, 'env');
  const plugins = [
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
      load(id) {
        if (!id.endsWith('.ejs')) {
          return null;
        }
        const code = readFileSync(id).toString('utf-8');
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
    base: '/',
    server: {
      open: false,
      port: 3e3,
      strictPort: true,
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
    preview: {
      port: 3e3,
      strictPort: true,
    },
    resolve: {
      dedupe: ['react-router-dom', '@navikt/ds-react', '@navikt/ds-icons'],
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
export { vite_config_default as default };
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvbmF2L0RvY3VtZW50cy9kZXYvc2tqZW1hYnlnZ2luZy1mb3JtaW8vcGFja2FnZXMvYnlnZ2VyXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvbmF2L0RvY3VtZW50cy9kZXYvc2tqZW1hYnlnZ2luZy1mb3JtaW8vcGFja2FnZXMvYnlnZ2VyL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9uYXYvRG9jdW1lbnRzL2Rldi9za2plbWFieWdnaW5nLWZvcm1pby9wYWNrYWdlcy9ieWdnZXIvdml0ZS5jb25maWcudHNcIjsvLy8gPHJlZmVyZW5jZSB0eXBlcz1cInZpdGVzdFwiIC8+XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHsgcmVhZEZpbGVTeW5jIH0gZnJvbSAnZnMnO1xuaW1wb3J0IGxvZGFzaFRlbXBsYXRlIGZyb20gJ2xvZGFzaC90ZW1wbGF0ZSc7XG5pbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYsIFBsdWdpbk9wdGlvbiB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHsgY3JlYXRlSHRtbFBsdWdpbiB9IGZyb20gJ3ZpdGUtcGx1Z2luLWh0bWwnO1xuaW1wb3J0IHRzY29uZmlnUGF0aHMgZnJvbSAndml0ZS10c2NvbmZpZy1wYXRocyc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCAnZW52Jyk7XG4gIGNvbnN0IHBsdWdpbnM6IFBsdWdpbk9wdGlvbiA9IFtcbiAgICByZWFjdCgpLFxuICAgIGNyZWF0ZUh0bWxQbHVnaW4oe1xuICAgICAgbWluaWZ5OiB0cnVlLFxuICAgICAgaW5qZWN0OiB7XG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAuLi5lbnYsXG4gICAgICAgICAgVklURV9HSVRfVkVSU0lPTjogZW52LlZJVEVfR0lUX1ZFUlNJT04gPz8gJycsXG4gICAgICAgICAgVklURV9HSVRfQlJBTkNIOiBlbnYuVklURV9HSVRfQlJBTkNIID8/ICcnLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9KSxcbiAgICB7XG4gICAgICBuYW1lOiAnZm9ybWlvLXRlbXBsYXRlLWhhbmRsZXInLFxuICAgICAgZW5mb3JjZTogJ3ByZScsXG4gICAgICBjb25maWcoKSB7fSxcbiAgICAgIGxvYWQoaWQ6IHN0cmluZykge1xuICAgICAgICBpZiAoIWlkLmVuZHNXaXRoKCcuZWpzJykpIHtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNvZGUgPSByZWFkRmlsZVN5bmMoaWQpLnRvU3RyaW5nKCd1dGYtOCcpO1xuICAgICAgICAvLyBVc2Ugc2FtZSB2YWx1ZXMgaW4gRm9ybWlvLlV0aWxzLkV2YWx1YXRvci50ZW1wbGF0ZVNldHRpbmdzXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gbG9kYXNoVGVtcGxhdGUoY29kZSwge1xuICAgICAgICAgIHZhcmlhYmxlOiAnY3R4JyxcbiAgICAgICAgICBldmFsdWF0ZTogL1xceyUoW1xcc1xcU10rPyklfS9nLFxuICAgICAgICAgIGludGVycG9sYXRlOiAvXFx7XFx7KFtcXHNcXFNdKz8pfX0vZyxcbiAgICAgICAgICBlc2NhcGU6IC9cXHtcXHtcXHsoW1xcc1xcU10rPyl9fX0vZyxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGBleHBvcnQgZGVmYXVsdCAke3RlbXBsYXRlfTtgO1xuICAgICAgfSxcbiAgICB9LFxuICBdO1xuXG4gIGlmIChtb2RlICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICBwbHVnaW5zLnB1c2godHNjb25maWdQYXRocygpKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgYmFzZTogJy8nLFxuICAgIHNlcnZlcjoge1xuICAgICAgb3BlbjogZmFsc2UsXG4gICAgICBwb3J0OiAzMDAwLFxuICAgICAgc3RyaWN0UG9ydDogdHJ1ZSxcbiAgICAgIHByb3h5OiB7XG4gICAgICAgICcvYXBpJzoge1xuICAgICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6ODA4MCcsXG4gICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICAgIHByZXZpZXc6IHtcbiAgICAgIHBvcnQ6IDMwMDAsXG4gICAgICBzdHJpY3RQb3J0OiB0cnVlLFxuICAgIH0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgZGVkdXBlOiBbJ3JlYWN0LXJvdXRlci1kb20nLCAnQG5hdmlrdC9kcy1yZWFjdCcsICdAbmF2aWt0L2RzLWljb25zJ10sXG4gICAgfSxcbiAgICBwbHVnaW5zLFxuICAgIHRlc3Q6IHtcbiAgICAgIGdsb2JhbHM6IHRydWUsXG4gICAgICBlbnZpcm9ubWVudDogJ2pzZG9tJyxcbiAgICAgIHNldHVwRmlsZXM6ICcuL3NyYy9zZXR1cFRlc3RzLnRzJyxcbiAgICAgIGluY2x1ZGU6IFsnc3JjLygqKi8pPyoudGVzdC5banRdcyh4KT8nXSxcbiAgICB9LFxuICB9O1xufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQ0EsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sb0JBQW9CO0FBQzNCLFNBQVMsY0FBYyxlQUE2QjtBQUNwRCxTQUFTLHdCQUF3QjtBQUNqQyxPQUFPLG1CQUFtQjtBQUUxQixJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUN4QyxRQUFNLE1BQU0sUUFBUSxNQUFNLEtBQUs7QUFDL0IsUUFBTSxVQUF3QjtBQUFBLElBQzVCLE1BQU07QUFBQSxJQUNOLGlCQUFpQjtBQUFBLE1BQ2YsUUFBUTtBQUFBLE1BQ1IsUUFBUTtBQUFBLFFBQ04sTUFBTTtBQUFBLFVBQ0osR0FBRztBQUFBLFVBQ0gsa0JBQWtCLElBQUksb0JBQW9CO0FBQUEsVUFDMUMsaUJBQWlCLElBQUksbUJBQW1CO0FBQUEsUUFDMUM7QUFBQSxNQUNGO0FBQUEsSUFDRixDQUFDO0FBQUEsSUFDRDtBQUFBLE1BQ0UsTUFBTTtBQUFBLE1BQ04sU0FBUztBQUFBLE1BQ1QsU0FBUztBQUFBLE1BQUM7QUFBQSxNQUNWLEtBQUssSUFBWTtBQUNmLFlBQUksQ0FBQyxHQUFHLFNBQVMsTUFBTSxHQUFHO0FBQ3hCLGlCQUFPO0FBQUEsUUFDVDtBQUVBLGNBQU0sT0FBTyxhQUFhLEVBQUUsRUFBRSxTQUFTLE9BQU87QUFFOUMsY0FBTSxXQUFXLGVBQWUsTUFBTTtBQUFBLFVBQ3BDLFVBQVU7QUFBQSxVQUNWLFVBQVU7QUFBQSxVQUNWLGFBQWE7QUFBQSxVQUNiLFFBQVE7QUFBQSxRQUNWLENBQUM7QUFFRCxlQUFPLGtCQUFrQixRQUFRO0FBQUEsTUFDbkM7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUVBLE1BQUksU0FBUyxjQUFjO0FBQ3pCLFlBQVEsS0FBSyxjQUFjLENBQUM7QUFBQSxFQUM5QjtBQUVBLFNBQU87QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLFFBQVE7QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLFlBQVk7QUFBQSxNQUNaLE9BQU87QUFBQSxRQUNMLFFBQVE7QUFBQSxVQUNOLFFBQVE7QUFBQSxVQUNSLGNBQWM7QUFBQSxRQUNoQjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxNQUFNO0FBQUEsTUFDTixZQUFZO0FBQUEsSUFDZDtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsUUFBUSxDQUFDLG9CQUFvQixvQkFBb0Isa0JBQWtCO0FBQUEsSUFDckU7QUFBQSxJQUNBO0FBQUEsSUFDQSxNQUFNO0FBQUEsTUFDSixTQUFTO0FBQUEsTUFDVCxhQUFhO0FBQUEsTUFDYixZQUFZO0FBQUEsTUFDWixTQUFTLENBQUMsNEJBQTRCO0FBQUEsSUFDeEM7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
