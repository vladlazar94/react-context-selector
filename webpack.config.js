const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ProgressBarPlugin = require("progress-bar-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
    mode: "development",
    devtool: "inline-source-map",
    entry: path.resolve(__dirname, "dev", "index.tsx"),
    output: {
        path: path.resolve(__dirname, "dist"),
    },
    devServer: {
        contentBase: "./dist",
        hot: true,
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: [{ loader: "ts-loader" }],
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new ProgressBarPlugin(),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "static", "index.html"),
        }),
    ],
};
