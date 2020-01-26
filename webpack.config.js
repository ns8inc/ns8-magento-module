/* eslint-disable
  @typescript-eslint/explicit-function-return-type,
  @typescript-eslint/no-empty-function,
  @typescript-eslint/no-var-requires,
  func-names,
  no-console,
  global-require */
// This plugin can increase the performance of the build by caching and incrementally building
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
require('dotenv-extended').load();

/**
 * This is the webpack plugin that compiles the TSD file for use in the final bundle.
 * NOTE: Using legacy JavaScript concepts to build this plugin, because it works as-is.
 */
function DtsBundlePlugin() {}
DtsBundlePlugin.prototype.apply = function(compiler) {
  const dts = require('dts-bundle');
  compiler.plugin('done', () => {
    dts.bundle({
      name: 'app',
      main: '.tmp/index.d.ts',
      out: '../dist/switchboard.d.ts',
      removeSource: false,
      outputAsModuleFolder: true, // to use npm in-package typings
    });
  });
};

const PRODUCTION = 'production';
const DEVELOPMENT = 'development';

let mode = PRODUCTION;
if (process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase().startsWith('prod') !== true) {
  mode = DEVELOPMENT;
}
console.log(`Compiling in ${process.env.NODE_ENV}:${mode} mode`);

const config = {
  entry: './switchboard/index.ts',
  mode,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: mode === PRODUCTION ? 'switchboard.min.js' : 'switchboard.js',
    library: 'switchboard',
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
  resolve: {
    extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js'],
    modules: ['node_modules'],
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'awesome-typescript-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    new DtsBundlePlugin(),
    new HardSourceWebpackPlugin(),
    new webpack.DefinePlugin({
      'global.GENTLY': false,
    }),
  ],
  target: 'node',
  node: {
    __dirname: false,
    __filename: false,
  },
};

module.exports = config;
