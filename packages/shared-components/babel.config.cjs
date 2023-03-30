const presets = [
  [
    "@babel/preset-env",
    {
      modules: "auto",
      loose: true,
    },
  ],
  "@babel/preset-typescript",
  ["@babel/preset-react", { runtime: "automatic" }],
];
const env = {
  test: {
    plugins: ["@babel/plugin-transform-modules-commonjs"],
  },
};

module.exports = { presets, env };
