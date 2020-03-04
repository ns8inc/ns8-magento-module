/* eslint-disable
  func-names,
  no-console,
  global-require,
  @typescript-eslint/no-var-requires */
const path = require('path');
const webpack = require('webpack');
// This plugin can increase the performance of the build by caching and incrementally building
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');

require('dotenv-extended').load();

const PRODUCTION = 'production';
const DEVELOPMENT = 'development';

const isDev = process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase().startsWith('prod') !== true;
const mode = isDev ? DEVELOPMENT : PRODUCTION;

console.log(`Compiling in ${process.env.NODE_ENV}:${mode} mode`);

const config = {
  entry: './switchboard/index.ts',
  mode,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'switchboard.js',
    library: 'switchboard',
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
  resolve: {
    extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js'],
    modules: ['node_modules'],
  },
  devtool: 'source-map',
  externals: {
    'aws-sdk': {
      commonjs: 'aws-sdk',
      commonjs2: 'aws-sdk',
    },
  },
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
