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
  module: {
    rules: [
      {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          'less-loader'
        ],
      },
    ]
  },
  resolve: {
    modules: [path.resolve(__dirname, 'node_modules'), 'node_modules']
  }
};
