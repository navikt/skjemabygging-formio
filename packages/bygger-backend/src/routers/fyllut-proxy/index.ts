import express from 'express';
import httpProxy from 'http-proxy';
import config from '../../config';
import { logger } from '../../logging/logger';

const fyllutBaseUrl = config.fyllut.baseUrl;
const proxy = httpProxy.createProxyServer({});
proxy.on('proxyReq', (proxyReq) => {
  proxyReq.removeHeader('authorization');
});

const fyllutProxyRouter = express.Router();

function logProxyError(proxyMessage: string, err: any, method: string, url: string) {
  const { message, stack, ...errDetails } = err;
  logger.error(`${proxyMessage}: ${message}`, {
    method,
    url,
    fyllutBaseUrl,
    stack,
    errDetails,
  });
}

fyllutProxyRouter.all('*path', async (req, res, next) => {
  const { method, url } = req;
  try {
    logger.info(`Fyllut proxy ${method} ${url}`, { fyllutBaseUrl });
    proxy.web(
      req,
      res,
      {
        target: fyllutBaseUrl,
        changeOrigin: true,
        proxyTimeout: 60000,
        timeout: 60000,
      },
      (err) => {
        logProxyError('Fyllut proxy - error callback', err, method, url);
        next(err);
      },
    );
  } catch (err: any) {
    logProxyError('Fyllut proxy - error was thrown', err, method, url);
    next(err);
  }
});

export default fyllutProxyRouter;
