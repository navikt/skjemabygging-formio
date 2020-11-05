const CracoLessPlugin = require("craco-less");

const path = require("path");
const resolvePackage = (relativePath) => path.resolve(__dirname, relativePath);

module.exports = {
  plugins: [{ plugin: CracoLessPlugin }],
  webpack: {
    alias: {
      react: resolvePackage("./node_modules/react"),
    },
  },
};
