var nodeExternals = require("webpack-node-externals");

const config = {
  externals: [
    'react',
    'react-dom',
    'react-router-dom',
    /^formiojs($|\/)/,
    'eventemitter2',
    /^moment($|\/)/,
    nodeExternals()],
  entry: ["./src/index.js"],
  mode: "none",
  output: {
    libraryTarget: "commonjs2",
    path: __dirname + "/dist",
    filename: "index.js",
  },
  module: {
    // 3
    rules: [
      {
        test: [/\.js$/, /\.jsx$/],
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            configFile: "./babel.config.cjs",
          },
        },
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
    extensions: [".js", ".jsx"],
  },
};
module.exports = config;
