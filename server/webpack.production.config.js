const webpack = require("webpack");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./server/server.ts",
  output: {
    filename: "server.js",
    path: __dirname + "/../out"
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("production")
    }),
    new UglifyJSPlugin(),
    new CopyWebpackPlugin([{ from: "server/static" }])
  ],
  mode: "production",
  target: "node",
  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".ts", ".tsx", ".js", ".json"]
  },

  module: {
    rules: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
      // When using TypeScript, Babel is not required, but React Hot Loader will not work (properly) without it.
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              babelrc: true
            }
          },
          {
            loader: "awesome-typescript-loader",
            options: {
              configFileName: "server/tsconfig.json"
            }
          }
        ]
      }
    ]
  }
};
