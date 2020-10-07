module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/my-project/'
    : '/',
  configureWebpack: {
    devServer: {
      headers: { "Access-Control-Allow-Origin": "*" }
    }
  }
};