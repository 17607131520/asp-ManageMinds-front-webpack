// 引入 HtmlWebpackPlugin 插件，用于生成 HTML 文件并自动注入打包后的资源
const HtmlWebpackPlugin = require('html-webpack-plugin');
// 引入 ReactRefreshWebpackPlugin 插件，用于实现 React 组件的热更新（仅开发环境使用）
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // 用于生产环境提取 CSS
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin'); // 用于压缩 CSS
const Dotenv = require('dotenv-webpack'); // 用于加载环境变量
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer'); // 用于分析打包体积
const FriendlyErrorsWebpackPlugin = require('@soda/friendly-errors-webpack-plugin'); // 友好错误提示
const TerserPlugin = require('terser-webpack-plugin'); // 用于压缩 JS
const ProgressBarPlugin = require('progress-bar-webpack-plugin'); // 显示打包进度条

// 判断当前是否为开发环境
const isDev = process.env.NODE_ENV !== 'production';

module.exports = {
  // 设置构建模式，开发环境为 development，生产环境为 production
  mode: isDev ? 'development' : 'production',
  // 入口文件配置
  entry: {
    app: './src/index.tsx', // 应用主入口
  },
  // 输出相关配置
  output: {
    // 输出目录，使用绝对路径
    path: path.resolve(__dirname, 'dist'),
    // 输出文件名，生产环境带 hash 便于缓存
    filename: isDev ? '[name].js' : '[name].[contenthash:8].js',
    publicPath: '/', // 公共路径，通常用于 SPA
    clean: true, // 每次打包前清空输出目录
  },
  // 开发服务器配置，仅开发环境生效
  devServer: {
    static: path.join(__dirname, 'dist'),
    port: 'auto', // 自动查找可用端口
    compress: true,
    hot: true,
    open: true,
    client: {
      logging: 'error',
      overlay: {
        errors: true,
        warnings: true,
      },
      progress: true,
    },
    liveReload: true,
    historyApiFallback: true,
    watchFiles: ['/src/**'],
    onListening(devServer) {
      const port = devServer.server.address().port;
      console.log(`\n🚀 开发服务器已启动，监听端口 ${port}`);
      console.log(`📱 本地访问: http://localhost:${port}`);
      console.log(`🌍 局域网访问: http://${require('ip').address()}:${port}\n`);
    },
    setupExitSignals: true,
  },
  // 模块解析配置
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // 路径别名，@ 代表 src 目录
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'], // 自动解析扩展名
    modules: [path.resolve(__dirname, 'src'), 'node_modules'], // 模块查找目录
  },
  // 插件配置
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html', // HTML 模板路径
      filename: 'index.html', // 生成的 HTML 文件名
    }),
    new Dotenv({
      path: `./.env.${process.env.NODE_ENV}`, // 根据环境加载不同的 .env 文件
      systemvars: true, // 允许读取系统环境变量
      allowEmptyValues: true, // 允许空值
      defaults: true, // 允许使用默认值
    }),
    new FriendlyErrorsWebpackPlugin(), // 更友好的错误提示
    new ProgressBarPlugin(), // 打包进度条
    isDev && new ReactRefreshWebpackPlugin(), // 仅开发环境启用 React 热更新
    !isDev &&
      new MiniCssExtractPlugin({
        filename: '[name].[contenthash:8].css', // 生产环境提取 CSS 并加 hash
      }),
    !isDev && new BundleAnalyzerPlugin({ analyzerMode: 'static', openAnalyzer: false }), // 生产环境分析打包体积
  ].filter(Boolean), // 过滤掉无效插件（如 isDev 为 false 时）
  // 模块加载规则
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/, // 处理 JS/TS/JSX/TSX 文件
        use: [
          // 开发环境下使用 babel-loader 并启用 react-refresh/babel 插件
          isDev && { loader: 'babel-loader', options: { plugins: ['react-refresh/babel'] } },
          // 生产环境只用 babel-loader，不加热更新插件
          !isDev && 'babel-loader',
        ].filter(Boolean),
        exclude: /node_modules/, // 排除 node_modules
      },
      {
        test: /\.less$/, // 处理 less 文件
        use: [
          isDev ? 'style-loader' : MiniCssExtractPlugin.loader, // 开发用 style-loader，生产提取 CSS
          { loader: 'css-loader', options: { modules: false } }, // 关闭 CSS modules
          'postcss-loader', // 自动加前缀等
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true, // 允许 less 里用 JS
                modifyVars: { '@primary-color': '#1DA57A' }, // antd 主题色举例
              },
            },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg|woff2?|eot|ttf)$/, // 处理图片和字体
        type: 'asset', // 自动选择资源类型
        parser: { dataUrlCondition: { maxSize: 10 * 1024 } }, // 小于 10KB 转 base64
        generator: { filename: 'static/[name].[contenthash:8][ext]' }, // 输出路径和文件名
      },
      {
        test: /\.svg$/, // 处理 svg 文件（React 组件方式）
        use: ['@svgr/webpack'],
        issuer: /\.[jt]sx?$/, // 仅在 js/ts 文件中引入时生效
      },
      {
        test: /\.(css)$/, // 处理 css 文件
        use: [isDev ? 'style-loader' : MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
      },
    ],
  },
  // 构建缓存配置，加快二次构建速度
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename],
      tsconfig: [path.resolve(__dirname, 'tsconfig.json')], // 添加 tsconfig 依赖
    },
    cacheDirectory: path.resolve(__dirname, 'node_modules/.cache/webpack'),
    name: `${process.env.NODE_ENV}-${process.env.BABEL_ENV || 'default'}`,
    compression: 'gzip',
    hashAlgorithm: 'md4',
    store: 'pack',
    idleTimeout: 10000,
    idleTimeoutForInitialStore: 5000,
    maxAge: 1000 * 60 * 60 * 24,
    allowCollectingMemory: true,
    profile: true,
  },
  // 优化相关配置
  optimization: {
    moduleIds: 'deterministic', // 使用确定的模块 ID，提升缓存命中率
    chunkIds: 'deterministic', // 使用确定的 chunk ID，提升缓存命中率
    splitChunks: {
      chunks: 'all',
      minSize: 20000, // 最小尺寸，小于此值的模块不会被分割
      minChunks: 1, // 最小被引用次数
      maxAsyncRequests: 30, // 最大异步请求数
      maxInitialRequests: 30, // 最大初始化请求数
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10, // 优先级
          reuseExistingChunk: true, // 重用已存在的 chunk
        },
        common: {
          name: 'common',
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    },
    runtimeChunk: {
      name: 'runtime',
    },
    minimize: !isDev,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: !isDev,
            drop_debugger: !isDev,
            pure_funcs: ['console.log'], // 移除 console.log
          },
          format: {
            comments: false,
          },
        },
        parallel: true,
        extractComments: false,
      }),
      new CssMinimizerPlugin({
        parallel: true,
      }),
    ],
  },
  // source map 配置，开发环境用 cheap-module-source-map，生产用 hidden-source-map
  devtool: isDev ? 'cheap-module-source-map' : 'hidden-source-map',
  // 性能提示配置
  performance: {
    hints: isDev ? false : 'warning', // 生产环境超出体积限制时警告
    maxEntrypointSize: 512000, // 入口文件最大体积
    maxAssetSize: 512000, // 单个资源最大体积
  },
  // 控制台输出内容
  stats: {
    warnings: true,
    errors: true,
    errorDetails: true,
    warningsFilter: /export.*was not found in/,
    chunks: false,
    modules: false,
    children: false,
  },
};
