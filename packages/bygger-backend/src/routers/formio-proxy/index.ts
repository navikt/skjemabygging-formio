import express from 'express';
import httpProxy from 'http-proxy';
import config from '../../config';
import { logger } from '../../logging/logger';

const formioProjectUrl = config.formio.projectUrl;
const proxy = httpProxy.createProxyServer({});

const formioProxyRouter = express.Router();

formioProxyRouter.all('*', async (req, res, next) => {
  try {
    const { method, url } = req;
    logger.info(`Formio API proxy ${method} ${url}`, { formioProjectUrl });
    proxy.web(
      req,
      res,
      {
        target: formioProjectUrl,
        changeOrigin: true,
        proxyTimeout: 60000,
        timeout: 60000,
        xfwd: true,
      },
      (err) => {
        logger.error(`Formio API proxy error: ${err.message}`, { method, url, formioProjectUrl });
        next(err);
      },
    );
  } catch (err) {
    next(err);
  }
});

export default formioProxyRouter;
