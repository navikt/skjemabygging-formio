const CracoLessPlugin = require("craco-less");
const { addBeforeLoader, loaderByName } = require("@craco/craco");

const path = require("path");
const resolvePackage = (relativePath) => path.resolve(__dirname, relativePath);

module.exports = {
  jest: {
    configure: { modulePaths: ["node_modules"] },
  },
  webpack: {
    configure: function (webpackConfig) {
      const ejsLoader = {
        test: /\.ejs$/,
        loader: "ejs-loader",
        options: {
          variable: "ctx",
          evaluate: /\{%([\s\S]+?)%\}/g,
          interpolate: /\{\{([\s\S]+?)\}\}/g,
          escape: /\{\{\{([\s\S]+?)\}\}\}/g,
        },
      };
      addBeforeLoader(webpackConfig, loaderByName("file-loader"), ejsLoader);
      return webpackConfig;
    },
    alias: {
      react: resolvePackage("./node_modules/react"),
      "react-dom": resolvePackage("./node_modules/react-dom"),
      "react-router-dom": resolvePackage("./node_modules/react-router-dom"),
      formiojs: resolvePackage("./node_modules/formiojs"),
    },
  },
  plugins: [
    {
      plugin: CracoLessPlugin,
    },
  ],
};
