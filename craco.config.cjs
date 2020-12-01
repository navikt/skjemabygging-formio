const CracoLessPlugin = require("craco-less");
const { addBeforeLoader, loaderByName } = require("@craco/craco");

module.exports = {
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
  ],
};
