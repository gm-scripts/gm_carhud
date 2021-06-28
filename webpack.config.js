const webpack = require("webpack");
const path = require("path");

const buildPath = path.resolve(__dirname, "gm_carhud");

const server = {
  entry: "./src/server/entry.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: ["ts-loader", "eslint-loader"],
        exclude: /node_modules/,
      },
    ],
  },
  optimization: {
    minimize: true,
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "main.js",
    path: path.resolve(buildPath, "server"),
  },
  target: "node",
};

const client = {
  entry: "./src/client/entry.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: ["ts-loader", "eslint-loader"],
        exclude: /node_modules/,
      },
    ],
  },
  optimization: {
    minimize: true,
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "main.js",
    path: path.resolve(buildPath, "client"),
  },
};

module.exports = [server, client];
