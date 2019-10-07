/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */
/* eslint-disable func-names */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
const fs = require('fs');
const path = require('path');

function DtsBundlePlugin() {};
DtsBundlePlugin.prototype.apply = function (compiler) {
  const dts = require('dts-bundle');
  compiler.plugin('done', () => {
    dts.bundle({
      name: 'app',
      main: 'tmp_tsc_compile/index.d.ts',
      out: '../dist/index.d.ts',
      removeSource: false,
      outputAsModuleFolder: true, // to use npm in-package typings
    });
  });
};

// Resolve Common JS & Node Modules
const nodeModules = {};
fs
  .readdirSync('node_modules')
  .filter((x) => ['.bin'].indexOf(x) === -1)
  .forEach((mod) => {
    nodeModules[mod] = `commonjs ${mod}`;
  });

const config = {
  entry: './index.ts',
  mode: 'development',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    library: 'index',
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
  resolve: {
    extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js'],
  },
  devtool: 'source-map',

  module: {
    rules: [{
      test: /\.tsx?$/,
      use: [{
        loader: 'awesome-typescript-loader',
      }],
      exclude: /node_modules/,
    }],
  },
  plugins: [
    new DtsBundlePlugin(),
  ],
  target: 'node',
  node: {
    __dirname: false,
    __filename: false,
  },
  externals: nodeModules,
};

module.exports = config;
