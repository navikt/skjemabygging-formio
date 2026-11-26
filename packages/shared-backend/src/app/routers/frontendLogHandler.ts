import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import type { Request, Response } from 'express';
import type { Logger } from '../../shared/logger/types';
import requestUtil from '../../util/request/requestUtil';

const createFrontendLogHandler = (logger: Pick<Logger, 'info' | 'warn'>) => (req: Request, res: Response) => {
  const level = requestUtil.getStringParam(req, 'level');
  const logEntry = {
    ...req.body,
    source: 'frontend',
  };
  switch (level) {
    case 'info':
      logger.info(logEntry);
      break;
    // Frontend errors are logged as warnings. The endpoint is open, and the backend already logs the
    // server errors it causes, so a frontend report alone should not trigger error alerts.
    case 'error':
      logger.warn(logEntry);
      break;
    default:
      throw new ResponseError('BAD_REQUEST', `Unsupported log level: ${level}`);
  }
  res.sendStatus(200);
};

export { createFrontendLogHandler };
