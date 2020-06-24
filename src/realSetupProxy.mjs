import proxyMiddleware from "http-proxy-middleware";
console.log(proxyMiddleware);

export default function(app) {
    app.use(
        '/api',
        proxyMiddleware.createProxyMiddleware({
            target: 'http://localhost:8080',
            changeOrigin: true,
        })
    );
}