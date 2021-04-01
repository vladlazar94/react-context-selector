import path from "path";
import Webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";

const config: Webpack.Configuration = {
    mode: "development",
    devtool: "cheap-module-source-map",
    entry: path.resolve(__dirname, "dev", "main.tsx"),
    output: { path: path.resolve(__dirname, "dist") },
    resolve: {
        extensions: [".ts", ".tsx", ".js", "jsx"],
    },
    module: {
        rules: [
            {
                test: /\.(t|j)sx?$/,
                exclude: /node_modules/,
                use: [{ loader: "ts-loader" }],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "dev", "index.html"),
        }),
    ],
};

export default config;
