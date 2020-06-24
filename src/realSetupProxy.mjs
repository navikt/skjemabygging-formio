import proxyMiddleware from "http-proxy-middleware";
import {dispatcherWithBackend, Backend} from './backend/index.mjs';

const directBackend = dispatcherWithBackend(new Backend());
const proxiedBackend = proxyMiddleware.createProxyMiddleware({
  target: 'http://localhost:8080',
  changeOrigin: true,
});

const backend = directBackend;

export default function(app) {
    app.use(
        '/api',
        backend
    );
}