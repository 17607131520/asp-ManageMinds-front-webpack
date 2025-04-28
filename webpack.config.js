// 引入 HtmlWebpackPlugin 插件，用于生成 HTML 文件并自动注入打包后的资源
const HtmlWebpackPlugin = require('html-webpack-plugin');
// 引入 ReactRefreshWebpackPlugin 插件，用于实现 React 组件的热更新
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const FriendlyErrorsWebpackPlugin = require('@soda/friendly-errors-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');

const isDev = process.env.NODE_ENV !== 'production';

module.exports = {
  // 设置构建模式为开发模式，会包含调试信息和优化开发体验的功能
  mode: isDev ? 'development' : 'production',
  entry: {
    app: './src/index.tsx',
  },
  // 配置打包输出信息
  output: {
    // 指定输出文件的目录，使用 path.resolve 方法解析为绝对路径
    path: path.resolve(__dirname, 'dist'),
    // 指定输出文件的名称
    filename: isDev ? '[name].js' : '[name].[contenthash:8].js',
    publicPath: '/',
    clean: true,
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
      // 可根据需求调整日志级别，可选值有 'log', 'info', 'warn', 'error', 'none'
      logging: 'none',
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
      // 可根据需求调整启动时的输出信息
      console.log(`开发服务器已启动，监听端口 ${port}`);
    },
  },
  // 配置模块解析规则
  resolve: {
    // 配置路径别名，方便在代码中引入模块
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    // 配置文件扩展名，当引入模块时可以省略这些扩展名
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
  },
  // 配置 Webpack 插件
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      // 指定生成的 HTML 文件的名称
      filename: 'index.html',
    }),
    new Dotenv({
      path: `./.env.${process.env.NODE_ENV}`,
      safe: true,
      systemvars: true,
      allowEmptyValues: true,
    }),
    new FriendlyErrorsWebpackPlugin(), // 更友好的错误提示
    new ProgressBarPlugin(),
    isDev && new ReactRefreshWebpackPlugin(),
    !isDev &&
      new MiniCssExtractPlugin({
        filename: '[name].[contenthash:8].css',
      }),
    !isDev && new BundleAnalyzerPlugin({ analyzerMode: 'static', openAnalyzer: false }),
  ].filter(Boolean),
  // 配置模块加载规则
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        use: [
          isDev && { loader: 'babel-loader', options: { plugins: ['react-refresh/babel'] } },
          !isDev && 'babel-loader',
        ].filter(Boolean),
        exclude: /node_modules/,
      },
      {
        test: /\.less$/,
        use: [
          isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
          { loader: 'css-loader', options: { modules: false } },
          'postcss-loader',
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true,
                modifyVars: { '@primary-color': '#1DA57A' }, // antd 主题色举例
              },
            },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg|woff2?|eot|ttf)$/,
        type: 'asset',
        parser: { dataUrlCondition: { maxSize: 10 * 1024 } },
        generator: { filename: 'static/[name].[contenthash:8][ext]' },
      },
      {
        test: /\.svg$/,
        use: ['@svgr/webpack'],
        issuer: /\.[jt]sx?$/,
      },
      {
        test: /\.(css)$/,
        use: [isDev ? 'style-loader' : MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
      },
    ],
  },
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename],
    },
  },
  // optimization: {
  //   // splitChunks: {
  //   //   chunks: 'all',
  //   // },
  //   minimize: true,
  //   minimizer: [
  //     '...', // 保留默认的 TerserPlugin
  //     new CssMinimizerPlugin(),
  //   ],
  // },

  // 优化配置
  optimization: {
    splitChunks: {
      chunks: 'all', // 代码分割
      cacheGroups: {
        vendors: { test: /[\\/]node_modules[\\/]/, name: 'vendors', chunks: 'all' },
      },
    },
    runtimeChunk: { name: 'runtime' }, // 提取runtime代码
    minimize: !isDev,
    minimizer: [
      new TerserPlugin({
        terserOptions: { compress: { drop_console: true } },
        parallel: true,
      }),
      new CssMinimizerPlugin(),
    ],
  },
  devtool: isDev ? 'cheap-module-source-map' : 'hidden-source-map',
  performance: {
    hints: isDev ? false : 'warning',
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
  stats: 'errors-warnings', // 控制台只输出错误和警告
};
