// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');

const config = {
  entry: './tests/web/index.ts',
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
    noParse: [require.resolve('typescript/lib/typescript.js')],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '...'],
    fallback: {
      fs: false,
      path: require.resolve('path-browserify'),
    },
  },
};

module.exports = () => {
  config.mode = 'development';

  return config;
};
