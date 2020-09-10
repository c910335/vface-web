var path = require('path');
 
module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, '.'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /.ts$/,
        exclude: /node_modules/,
        loader: 'ts-loader'
      }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, '.'),
    compress: true,
    port: 5567
  }
}
