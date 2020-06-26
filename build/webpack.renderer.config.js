const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const merge = require('lodash/merge');
const rules = require('./webpack.rules');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const webpackCommonConfig = require('./webpack.common.config');

/** @type {import('@types/webpack/index').Configuration} */
const config = {
  module: {
    rules: [
      ...rules,
      {
        test: /\.css$/,
        use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.styl(us)?$/,
        loader: [{ loader: 'style-loader' }, { loader: 'css-loader' }, { loader: 'stylus-loader' }]
      },
      {
        test: /\.less$/,
        loader: [{ loader: 'style-loader' }, { loader: 'css-loader' }, { loader: 'less-loader' }]
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        loader: 'url-loader?limit=100000'
      }
    ]
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin(),
    new VueLoaderPlugin(),
  ],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.vue'],
    alias: {
      vue$: require.resolve('vue') //'vue/dist/vue.runtime.esm.js',
    }
  },
};
module.exports = merge({}, webpackCommonConfig, config);