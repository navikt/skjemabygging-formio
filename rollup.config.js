import babel from "@rollup/plugin-babel";

import pkg from "./package.json";

export default [
  // CommonJS (for Node) and ES module (for bundlers) build.
  // (We could have three entries in the configuration array
  // instead of two, but it's quicker to generate multiple
  // builds from a single configuration where possible, using
  // an array for the `output` option, where we can specify
  // `file` and `format` for each target)
  {
    input: "lib/index.js",
    external: [
      "react",
      "react-dom",
      "prop-types",
      "eventemitter2",
      "formiojs",
      "formiojs/components/builder",
      "formiojs/components/_classes/component/editForm/Component.edit.validation",
      "formiojs/components/_classes/component/editForm/Component.edit.display",
      "formiojs/components/_classes/component/editForm/Component.edit.conditional",
      "formiojs/components/_classes/component/editForm/Component.edit.api",
      "formiojs/components/_classes/field/Field",
      "nav-frontend-skjema-style",
      "template",
      "nav-datovelger",
      "formiojs/components",
      "@material-ui/styles",
    ],
    output: [
      { file: pkg.module, format: "es" },
      { file: pkg.main, format: "cjs" },
    ],
    plugins: babel({
      exclude: "node_modules/**",
      babelHelpers: "bundled", // documentation seems to indicate we should rather be using 'runtime' as the value here
      plugins: ["@babel/plugin-proposal-class-properties"],
      presets: ["@babel/preset-react"],
    }),
  },
];
