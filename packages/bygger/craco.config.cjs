const CracoLessPlugin = require("craco-less");
const CracoAlias = require("craco-alias");
const { addBeforeLoader, loaderByName } = require("@craco/craco");

const path = require("path");
const resolvePackage = (relativePath) => path.resolve(__dirname, relativePath);

module.exports = {
  jest: {
    configure: {
      // transformIgnorePatterns: ["node_modules/(?!@navikt/ds-icons/)"],
      modulePaths: ["node_modules"],
    },
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
  },
  plugins: [
    {
      plugin: CracoLessPlugin,
    },
    {
      plugin: CracoAlias,
      options: {
        source: "options",
        baseUrl: "./",
        aliases: {
          "@material-ui/styles": resolvePackage("./node_modules/@material-ui/styles"),
          react: resolvePackage("./node_modules/react"),
          "react-dom": resolvePackage("./node_modules/react-dom"),
          "react-router-dom": resolvePackage("./node_modules/react-router-dom"),
          formiojs: resolvePackage("./node_modules/formiojs"),
        },
      },
    },
  ],
};
