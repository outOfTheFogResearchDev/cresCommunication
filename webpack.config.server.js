const { resolve } = require('path');

module.exports = {
  context: resolve(__dirname, 'server'),
  entry: './index.js',
  output: {
    path: resolve(__dirname, 'server/bundle'),
    filename: 'cres.js',
  },
  target: 'node',
  node: { __dirname: false, __filename: false },
  resolve: { extensions: ['.js'] },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: [/node_modules/],
        use: [{ loader: 'babel-loader' }],
      },
    ],
  },
};
