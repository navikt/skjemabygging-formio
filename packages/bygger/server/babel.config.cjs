module.exports = {
  presets: [["@babel/preset-env", { targets: { node: "16.17.1" }, modules: "commonjs" }], "@babel/preset-typescript"],
  plugins: ["babel-plugin-transform-import-meta"],
};