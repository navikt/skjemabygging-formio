import proxyMiddleware from "http-proxy-middleware";
import {Backend} from './backend';
import {dispatcherWithBackend} from "./backend/webApp.js";

const directBackend = dispatcherWithBackend(new Backend());
const proxiedBackend = proxyMiddleware.createProxyMiddleware({
  target: 'http://localhost:8080',
  changeOrigin: true,
});

function isOn(value) {
  if (!value) {
    return false;
  }
  return !(['off', 'false', 'no'].includes(value.toLowerCase));
}

const backend = isOn(process.env.REACT_APP_BACKEND_PROXY) ? proxiedBackend : directBackend;

export default function(app) {
  // are these needed and do they work
  // app.use(express.json());
  // app.use(express.urlencoded({extended: true}));

  app.use(
        '/api',
        backend
    );
}