const path = require('path');

module.exports = {
  entry: './src/public-api.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'gotcha.js',
    library: 'gotcha',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  }
};
