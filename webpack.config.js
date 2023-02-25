const path = require('path');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
var HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

/** 当时是否是开发环境 */
const isDev = process.env.NODE_ENV === 'development';

/** 要返回的webpack配置 */
var config = {
  target: 'electron-renderer',
  mode: isDev ? 'development' : 'production',
  // 入口文件
  entry: {
    main: './src/main.js'
  },
  // 输出目录
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js'
    // publicPath: '/dist/'
  },
  // 排除
  externals: {

  },
  // loader配置
  module: {
    rules: [
      {
        test: /\.node$/,
        loader: 'node-loader'
      },
      // cpp
      {
        test: /\.(cpp|hpp|h|inl)$/i,
        use: ['raw-loader']
      },
      // css
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      // less
      {
        test: /\.less$/,
        use: ['style-loader', {
          loader: 'css-loader',
          options: {
            modules: {
              mode: 'local',
              localIdentName: '[name]__[local]_[hash:base64:5]',
              context: path.resolve(__dirname, 'src'),
              hashPrefix: 'yz'
            }
          }
        }, 'less-loader', {
          loader: 'style-resources-loader'
        }]
      },
      // js载入
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: [
              '@babel/plugin-transform-modules-commonjs',
              '@babel/plugin-transform-runtime',
              'transform-remove-strict-mode',
              ['@babel/plugin-proposal-decorators', { 'legacy': true }]
            ]
          }
        }
      }
    ]
  },
  // 插件
  plugins: [
    // 将React加入到环境全局中
    new webpack.ProvidePlugin({
      React: 'react'
    }),
    // 生成主html文件
    new HtmlWebpackPlugin({
      template: 'module.html',
      inject: false,
      filename: 'index.html'
    })
  ],
  // 服务设置
  devServer: {
    hot: true,
    contentBase: path.join(__dirname, 'dist'),
    port: 13823,
    lazy: false,
    inline: false,
    clientLogLevel: 'none',
    open: false, // 是否自动打开默认浏览器
    // publicPath: '/static/viewer/',
    // 允许远端访问
    host: '0.0.0.0'
    // proxy: {
    //   '/': {
    //     // target: 'http://10.2.120.100:8360/',
    //     // target: 'http://10.2.112.197:8360/',
    //     target: 'http://127.0.0.1:13822/',
    //     bypass(req, res) {
    //       // 静态资源读取本地
    //       if (req.url.substr(0, 15) === '/static/viewer/') {
    //         return req.url.substr(14);
    //       }
    //     }
    //   }
    // }
  },
  resolve: {
    modules: [
      path.join(__dirname, './src/'),
      path.join(__dirname, './node_modules')
    ],
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
  },
  devtool: isDev ? 'cheap-module-eval-source-map' : 'none'
};

// 输出最终的配置
module.exports = config;
