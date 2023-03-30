import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import viteTsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    port: 3000,
  },
  optimizeDeps: {
    /*include: [
      "@navikt/skjemadigitalisering-shared-domain",
      "@navikt/skjemadigitalisering-shared-components"
    ],*/
    exclude: [
      "@navikt/skjemadigitalisering-shared-components",
      "react-csv",
      "nav-datovelger",
      "nav-frontend-core",
      "nav-frontend-ekspanderbartpanel-style",
      "nav-frontend-lenker-style",
      "nav-frontend-alertstriper-style",
      "nav-frontend-skjema-style",
      "nav-frontend-paneler-style",
      "nav-frontend-chevron-style",
      "nav-frontend-knapper-style",
      "nav-frontend-lukknapp-style",
      "nav-frontend-typografi-style",
      "nav-frontend-stegindikator-style",
    ],
  },
  /*
  resolve: {
    alias: [
      { find: "@navikt/skjemadigitalisering-shared-components", replacement: path.join(__dirname, "../shared-components") },
      { find: "@navikt/skjemadigitalisering-shared-domain", replacement: path.join(__dirname, "../shared-domain") }
    ],
  },
  */
  /*
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
      exclude: [
        "react-csv",
        "nav-datovelger",
        "nav-frontend-core",
        // "nav-frontend-ekspanderbartpanel",
        "nav-frontend-ekspanderbartpanel-style",
        // "nav-frontend-lenker",
        "nav-frontend-lenker-style",
        // "nav-frontend-alertstriper",
        "nav-frontend-alertstriper-style",
        // "nav-frontend-skjema",
        "nav-frontend-skjema-style",
        // "nav-frontend-paneler",
        "nav-frontend-paneler-style",
        // "nav-frontend-chevron",
        "nav-frontend-chevron-style",
        // "nav-frontend-knapper",
        "nav-frontend-knapper-style",
        // "nav-frontend-lukknapp",
        "nav-frontend-lukknapp-style",
        // "nav-frontend-typografi",
        "nav-frontend-typografi-style",
        // "nav-frontend-stegindikator",
        "nav-frontend-stegindikator-style",
      ],
    },
  },*/
  css: {
    preprocessorOptions: {
      less: {
        math: "always",
      },
    },
  },
  plugins: [react(), viteTsconfigPaths()],
});
