module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/vue-covid-labor-impact/'
    : '/',
  configureWebpack: {
    devServer: {
      headers: { "Access-Control-Allow-Origin": "*" }
    }
  }
};