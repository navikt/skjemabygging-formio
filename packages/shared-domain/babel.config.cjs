const presets = [["@babel/preset-env", { modules: false }], "@babel/preset-typescript"];
const env = {
  test: {
    plugins: ["@babel/plugin-transform-modules-commonjs"],
  },
};

module.exports = { presets, env };
