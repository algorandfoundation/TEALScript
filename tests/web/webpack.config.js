// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');
const webpack = require('webpack');
const { spawnSync } = require('child_process');

const config = {
  entry: path.resolve(__dirname, 'index.ts'),
  output: {
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: 'ts-loader',
        exclude: ['/node_modules/'],
      },
    ],
    noParse: [require.resolve('@ts-morph/common/dist/typescript.js')],
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.DefinePlugin({
      TEALSCRIPT_REF: JSON.stringify(spawnSync('git', ['rev-parse', 'HEAD']).stdout.toString().trim()),
    }),
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '...'],
    fallback: {
      fs: false,
      path: require.resolve('path-browserify'),
      buffer: require.resolve('buffer/'),
    },
  },
};

module.exports = () => {
  config.mode = 'development';

  return config;
};
