const path = require('path');
const HtmlWebpackPlugin=require("html-webpack-plugin")
const ReactRefreshWebpackPlugin=require("@pmmmwh/react-refresh-webpack-plugin")

module.exports={
    mode: "development",
    entry:"./src/index.js",
    output:{
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js",
    },
    devServer: {
        static:path.join(__dirname,'dist'),
        port: 3000,
        compress: true,
        hot: true,  // 启用热加载
        open:true,
        // proxy:{},
        client:{
            logging: 'info',
            overlay: true,
        },
        liveReload:true,
        historyApiFallback: true,
        watchFiles:["/src/**"],
        onListening: function(devServer) {
            const port = devServer.server.address().port;
            console.log(`Server is listening on port ${port}`);
        },
    },
    resolve:{
        alias: {
            "@/*": path.resolve(__dirname, "src")
        },
        extensions: ['.js', '.jsx', '.json', '.ts','tsx'] // 添加扩展名解析
    },
    plugins:[
        new HtmlWebpackPlugin({
            template:"./public/index.html",
            filename:"index.html"
        }),
        new ReactRefreshWebpackPlugin(),
    ],
    module:{
        rules:[
            {
                test: /\.(js|jsx)$/, // 匹配 .js 和 .jsx 文件
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                        plugins: [
                            'react-refresh/babel',
                        ]
                    }
                }
            }
        ]
    },
    optimization:{},
}