const CracoLessPlugin = require("craco-less");

const path = require("path");
const resolvePackage = (relativePath) => path.resolve(__dirname, relativePath);

module.exports = {
  plugins: [{ plugin: CracoLessPlugin }],
  webpack: {
    alias: {
      "@material-ui/styles": resolvePackage("./node_modules/@material-ui/styles"),
      react: resolvePackage("./node_modules/react"),
      "react-dom": resolvePackage("./node_modules/react-dom"),
      "react-router-dom": resolvePackage("./node_modules/react-router-dom"),
      formiojs: resolvePackage("./node_modules/formiojs"),
    },
  },
};
