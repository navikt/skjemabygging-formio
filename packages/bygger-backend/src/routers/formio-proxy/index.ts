import express from 'express';
import { logger } from '../../logging/logger';
import { getFormioApiServiceUrl } from '../../util/formio';

const formioProjectUrl = getFormioApiServiceUrl();
// const proxy = httpProxy.createProxyServer({});

const formioProxyRouter = express.Router();

//TODO: remove
formioProxyRouter.all('*', async (req, res, next) => {
  const { method, url } = req;
  try {
    logger.info(`Formio API proxy ${method} ${url}`, { formioProjectUrl });
    // proxy.web(
    //   req,
    //   res,
    //   {
    //     target: formioProjectUrl,
    //     changeOrigin: true,
    //     proxyTimeout: 60000,
    //     timeout: 60000,
    //   },
    //   (err) => {
    //     const { message, stack, ...errDetails } = err;
    //     logger.error(`Formio API proxy - error callback: ${message}`, {
    //       method,
    //       url,
    //       formioProjectUrl,
    //       stack,
    //       errDetails,
    //     });
    //     next(err);
    //   },
    // );
  } catch (err: any) {
    const { message, stack, ...errDetails } = err;
    logger.error(`Formio API proxy - error was thrown: ${message}`, {
      method,
      url,
      formioProjectUrl,
      stack,
      errDetails,
    });
    next(err);
  }
});

export default formioProxyRouter;
