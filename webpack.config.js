const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Webpack = require('webpack');
const Dotenv = require('dotenv');

const env = Dotenv.config().parsed || {};
const envKeys = Object.keys(env).reduce((prev, next) => {
  prev[`process.env.${next}`] = JSON.stringify(env[next]);
  return prev;
}, {});

module.exports = {
  entry: {
    main: './public/ts/index.ts',
    login: './public/ts/login.ts',
    login_callback: './public/ts/login_callback.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  plugins: [
    new Webpack.DefinePlugin(envKeys),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      chunks: ['main']
    }),
    new HtmlWebpackPlugin({
      template: './public/login.html',
      filename: 'login.html',
      chunks: ['login']
    }),
    new HtmlWebpackPlugin({
      template: './public/login_callback.html',
      filename: 'login_callback.html',
      chunks: ['login_callback']
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: './src/wasm/pkg', to: 'wasm' },
        { from: './public/css', to: 'css' },
        { from: './public/manifest.json', to: './manifest.json' },
        { from: './public/env-config.js', to: './env-config.js' },
        { from: './public/service-worker.js', to: './service-worker.js' },
        { from: './public/offline.html', to: './offline.html' }
      ],
    }),
  ],
  experiments: {
    asyncWebAssembly: true,
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 8080,
  },
};