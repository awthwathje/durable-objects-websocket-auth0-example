const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: './src/workers/index.js',
  target: 'web',
  mode: 'development',
  devtool: 'source-map',
  output: {
    filename: 'index.js',
    libraryTarget: 'commonjs',
    sourceMapFilename: 'index.js.map',
  },
  optimization: {
    minimize: true,
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: 'src/workers/shim.mjs', to: 'shim.mjs' }],
    }),
  ],
}
