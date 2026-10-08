import { renderIndexHtml } from '@navikt/skjemadigitalisering-shared-backend';
import { sendinnEntryUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import { config } from './config';
import { decorator, idportenAuth } from './services';

const getQuery = (url: string) => {
  const queryIndex = url.indexOf('?');
  return queryIndex === -1 ? '' : url.slice(queryIndex);
};

const getPublicUrl = (req: Request, returnPath: string) =>
  config.isDevelopment ? `http://localhost:${config.port}${returnPath}` : `https://${req.get('host')}${returnPath}`;

// Mounted under the sendinn base path, so req.path is relative to it.
const renderIndex = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = getQuery(req.url);
    const entry = sendinnEntryUtils.resolveEntry(req.path, new URLSearchParams(query));
    const returnPath = `${config.basePath}${req.path === '/' ? '' : req.path}${query}`;

    if (sendinnEntryUtils.requiresLogin(entry) && !(await idportenAuth.authenticate(req))) {
      return res.redirect(sendinnEntryUtils.createLoginUrl(returnPath));
    }

    renderIndexHtml(res, {
      decoratorFragments: await decorator.getDecorator(getPublicUrl(req, returnPath)),
      statusCode: entry.journey === 'unavailable' ? 404 : 200,
      umamiWebsiteId: config.umamiWebsiteId,
    });
  } catch (error) {
    next(error);
  }
};

export default renderIndex;
