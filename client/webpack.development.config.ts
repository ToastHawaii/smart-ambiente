import * as HtmlWebpackPlugin from "html-webpack-plugin";
import * as webpack from "webpack";

module.exports = {
  entry: "./client/scripts/index.tsx",
  output: {
    filename: "client.js",
    path: __dirname + "/../out/wwwroot"
  },
  plugins: [
    new HtmlWebpackPlugin({
      // Load a custom template
      template: "client/index.html"
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ],
  mode: "development",
  // Enable sourcemaps for debugging webpack's output.
  devtool: "inline-source-map",

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
              babelrc: true,
              plugins: ["react-hot-loader/babel"]
            }
          },
          {
            loader: "awesome-typescript-loader",
            options: {
              configFileName: "client/scripts/tsconfig.json"
            }
          }
        ]
      },

      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },

      // Load CSS files, embed small PNG/JPG/GIF/SVG images as well as fonts as Data URLs and copy larger files to the output directory
      { test: /\.css$/, use: ["style-loader", "css-loader"] },
      {
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        loader: "url-loader",
        options: {
          limit: 10000
        }
      }
    ]
  }
};
