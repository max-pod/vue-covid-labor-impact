module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/vue-covid-labor-impact/'
    : '/',
  configureWebpack: {
    module: {
      rules: [ {
        test: /\.md$/,
       loader: 'raw-loader', // npm install -D raw-loader
      }]
    },
    devServer: {
      headers: { "Access-Control-Allow-Origin": "*" }
    }
  }
};