const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  entry: {
    content_script: './content_script.js',
    options: './options.jsx',
  },
  output: {
    filename: '[name].js',
    path: path.resolve('./build'),
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: 'node_modules/bootstrap/dist/css',
        to: 'vendor/bootstrap',
      },
      {
        from: 'manifest.json',
        to: 'manifest.json',
      },
      {
        from: 'images',
        to: 'images',
      },
    ]),
    new HtmlWebpackPlugin({
      chunks: ['options'],
      template: './options.html',
      filename: 'options.html',
      inject: 'body',
      hash: true,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.jsx$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};
