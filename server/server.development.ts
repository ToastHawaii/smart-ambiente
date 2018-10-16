import * as webpackDevServer from "webpack-dev-server";
import * as webpack from "webpack";
import * as config from "../client/webpack.development.config";
import "./server";
import "sonos-http-api/server";

const options = {
  contentBase: "../smart-ambiente-media",
  hot: true,
  host: "localhost",
  proxy: {
    "/api": "http://localhost:3001"
  }
};

webpackDevServer.addDevServerEntrypoints(config, options);
const compiler = webpack(config);
const server = new webpackDevServer(compiler, options);

server.listen(3000, "localhost", function() {});
