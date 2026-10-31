const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function setupProxy(app) {
  app.use(
    createProxyMiddleware("/socket", {
      target: "http://localhost:4000",
      changeOrigin: true,
      ws: true,
    })
  );
};
