var nodeExternals = require("webpack-node-externals");

const config = {
  externals: [nodeExternals()],
  entry: ["./lib/index.js"],
  output: {
    path: __dirname + "/dist",
    filename: "index.js",
  },
  module: {
    // 3
    rules: [
      {
        test: [/\.js$/, /\.jsx$/],
        exclude: /node_modules/,
        use: "babel-loader",
      },
      {
        test: /\.ejs$/,
        use: {
          loader: "ejs-loader",
          options: {
            variable: "ctx",
            evaluate: /\{%([\s\S]+?)%\}/g,
            interpolate: /\{\{([\s\S]+?)\}\}/g,
            escape: /\{\{\{([\s\S]+?)\}\}\}/g,
          },
        },
      },

      {
        test: /\.less$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
            options: {
              modules: true,
            },
          },
          {
            loader: "less-loader", // compiles Less to CSS
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".js"],
  },
};
module.exports = config;
