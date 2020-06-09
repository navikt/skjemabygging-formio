const path = require('path');

module.exports = {
  entry: path.join(path.resolve(__dirname, 'lib'), 'index.js'),
  output: {
    library: 'navdesign',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist'),
    filename: 'navdesign.js',
  },
  mode: 'production',
  performance: { hints: false },
};
