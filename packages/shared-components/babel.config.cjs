const presets = [
  ["@babel/preset-env", { modules: false }],
  "@babel/preset-typescript",
  ["@babel/preset-react", { runtime: "automatic" }],
];
const env = {
  test: {
    plugins: ["@babel/plugin-transform-modules-commonjs"],
  },
};

module.exports = { presets, env };
