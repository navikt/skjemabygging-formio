var nodeExternals = require("webpack-node-externals");

const config = {
  externals: ["react", "react-dom", "react-router-dom", /^formiojs($|\/)/, /^moment($|\/)/, nodeExternals()],
  entry: ["./src/index.ts"],
  mode: "none",
  output: {
    path: __dirname + "/dist",
    filename: "index.js",
    libraryTarget: "commonjs2",
  },
  module: {
    // 3
    rules: [
      {
        test: [/\.jsx?$/, /\.tsx?$/],
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            configFile: "./babel.config.cjs",
          },
        },
        resolve: {
          fullySpecified: false,
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
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
};
module.exports = config;
