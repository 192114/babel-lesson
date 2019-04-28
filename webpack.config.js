const path = require('path')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin') // 压缩js

module.exports = (env, argv) => ({
  entry: ['./src/index.js'],

  output: {
    filename: '[name].[hash:8].js',
    chunkFilename: '[name].[hash:8].js', // 指定分离出来的代码文件的名称
    path: path.resolve(__dirname, 'dist'),
    publicPath: '' // 解释： https://juejin.im/post/5ae9ae5e518825672f19b094
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: [
          path.resolve(__dirname, 'src')
        ],
        use: [
          {
            loader: 'babel-loader'
          }
        ]
      }
    ]
  },

  plugins: [],

  // 优化部分
  optimization: {
    minimize: false,
    // minimizer: [
    //   new UglifyJsPlugin({
    //     test: /\.js(\?.*)?$/i,
    //     cache: true,
    //     parallel: true,
    //     uglifyOptions: {
    //       compress: {
    //         drop_console: true, // 删除console
    //       }
    //     }
    //   })
    // ],
  },

  // 处理解析
  resolve: {
    modules: [
      path.resolve(__dirname, 'node_modules'), // 使用绝对路径指定 node_modules，不做过多查询
    ],

    // 删除不必要的后缀自动补全，少了文件后缀的自动匹配，即减少了文件路径查询的工作
    // 其他文件可以在编码时指定后缀，如 import('./index.scss')
    extensions: ['.js', '.jsx'],

    // 避免新增默认文件，编码时使用详细的文件路径，代码会更容易解读，也有益于提高构建速度 （默认就是index）
    mainFiles: ['index']
  }
})
