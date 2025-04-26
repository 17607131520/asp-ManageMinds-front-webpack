// 将 CommonJS 模块引入方式转换为 ES 模块引入方式
// 引入 HtmlWebpackPlugin 插件，用于生成 HTML 文件并自动注入打包后的资源
const HtmlWebpackPlugin = require('html-webpack-plugin');
// 引入 ReactRefreshWebpackPlugin 插件，用于实现 React 组件的热更新
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const path = require('path');

module.exports = {
  // 设置构建模式为开发模式，会包含调试信息和优化开发体验的功能
  mode: 'development',
  entry: './src/index.tsx',
  // 配置打包输出信息
  output: {
    // 指定输出文件的目录，使用 path.resolve 方法解析为绝对路径
    path: path.resolve(__dirname, 'dist'),
    // 指定输出文件的名称
    filename: 'bundle.js',
  },
  // 配置开发服务器
  devServer: {
    // 指定开发服务器静态资源的根目录
    static: path.join(__dirname, 'dist'),
    // 设置开发服务器监听的端口号
    port: 3000,
    // 启用 Gzip 压缩
    compress: true,
    // 启用热模块替换功能
    hot: true, // 启用热加载
    // 启动服务器后自动打开浏览器
    open: true,
    // 配置代理，此处暂时为空
    // proxy:{},
    // 配置客户端行为
    client: {
      // 设置客户端日志级别为 info
      logging: 'info',
      // 当出现编译错误或警告时，在浏览器中显示全屏覆盖层
      overlay: true,
    },
    // 启用实时重新加载功能
    liveReload: true,
    // 当使用 HTML5 History API 时，所有 404 请求都将被重定向到 index.html
    historyApiFallback: true,
    // 监听指定目录下的文件变化，变化时自动刷新页面
    watchFiles: ['/src/**'],
    // 服务器启动成功后的回调函数
    onListening(devServer) {
      // 获取服务器监听的端口号
      const port = devServer.server.address().port;
      // 打印服务器监听的端口号
      console.log(`Server is listening on port ${port}`);
    },
  },
  // 配置模块解析规则
  resolve: {
    // 配置路径别名，方便在代码中引入模块
    alias: {
      '@/*': path.resolve(__dirname, 'src'),
    },
    // 配置文件扩展名，当引入模块时可以省略这些扩展名
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'], // 添加扩展名解析
  },
  // 配置 Webpack 插件
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      // 指定生成的 HTML 文件的名称
      filename: 'index.html',
    }),
    // 实例化 ReactRefreshWebpackPlugin 插件
    new ReactRefreshWebpackPlugin(),
  ],
  // 配置模块加载规则
  module: {
    rules: [
      {
        // 匹配 .js 和 .jsx 文件
        test: /\.(js|jsx|ts|tsx)$/, // 匹配 .js、.jsx、.ts 和 .tsx 文件
        exclude: /node_modules/, // 使用 babel-loader 处理匹配的文件
        use: {
          loader: 'babel-loader',
          options: {
            // 配置 Babel 预设
            presets: [
              ['@babel/preset-env', { targets: 'ie 6-11, > 0.25%, not dead' }],
              '@babel/preset-react',
              '@babel/preset-typescript',
            ], // 添加 TypeScript 预设
            // 配置 Babel 插件
            plugins: ['react-refresh/babel'],
          },
        },
      },
      {
        test: /\.less$/, // 匹配 .less 文件
        exclude: /node_modules/,
        use: [
          {
            loader: 'style-loader',
            options: {},
          },
          {
            loader: 'css-loader',
            options: {},
          },
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true,
              },
            },
          },
        ],
      },
    ],
  },
  // 配置优化选项
  optimization: {
    minimize: true, // 代码压缩，
  },
};
