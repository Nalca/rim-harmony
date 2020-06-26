const WebpackPermissionsPlugin = require('webpack-permissions-plugin');
const webpackCommonConfig = require('./webpack.common.config');
const merge = require('lodash/merge');
const path = require('path');

/** @type {import('@types/webpack/index').Configuration} */
const config = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './source/core/index.ts',
  // Put your normal webpack config below here
  module: {
    rules: require('./webpack.rules'),
  },
  plugins: [
    // Because the executable need to have execute permission (Or else, EACCES errors gonna pop)
    new WebpackPermissionsPlugin({
      buildFiles: [{
        path: path.resolve(__dirname, "..", ".webpack/main/native_modules/", "exiftool"),
        filemode: "755",
      }
      ]
    })
  ],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
  },
};
module.exports = merge({}, webpackCommonConfig, config);