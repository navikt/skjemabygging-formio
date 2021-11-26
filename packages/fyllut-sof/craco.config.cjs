const CracoLessPlugin = require("craco-less");
const CracoAlias = require("craco-alias");

const path = require("path");
const resolvePackage = (relativePath) => path.resolve(__dirname, relativePath);

module.exports = {
  jest: {
    configure: {
      modulePaths: ["node_modules"],
    },
  },
  plugins: [
    {
      plugin: CracoLessPlugin,
    },
    {
      plugin: CracoAlias,
      options: {
        aliases: {
          "@material-ui/styles": resolvePackage("./node_modules/@material-ui/styles"),
          react: resolvePackage("./node_modules/react"),
          "react-dom": resolvePackage("./node_modules/react-dom"),
          "react-router-dom": resolvePackage("./node_modules/react-router-dom"),
          formiojs: resolvePackage("./node_modules/formiojs"),
        },
      },
    },
  ],
};
