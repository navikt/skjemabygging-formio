module.exports = {
  presets: [["@babel/preset-env", { targets: { node: "14.17.0" }, modules: "commonjs" }], "@babel/preset-typescript"],
  plugins: ["babel-plugin-transform-import-meta"],
};
