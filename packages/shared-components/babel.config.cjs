const presets = ["@babel/preset-react"];
const plugins = [
  "@babel/plugin-transform-template-literals",
  "@babel/plugin-transform-arrow-functions",
  "@babel/plugin-proposal-class-properties",
];
const env = {
  "test": {
    "presets": [["@babel/preset-env", {"modules": false}]],
    "plugins": [ "@babel/plugin-transform-modules-commonjs" ]
  }
}

module.exports = { presets, plugins, env };
