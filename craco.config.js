const CracoLessPlugin = require("craco-less");

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
/*
// attempt to get hold of variables in js (nav design system variables)
      options: {
        cssLoaderOptions: {
          importLoaders: 2,
          onlyLocals: true
        }
      }
*/
    },
    ],
};