import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import type { Request, Response } from 'express';
import type { Logger } from '../../shared/logger/types';
import requestUtil from '../../util/request/requestUtil';

const createFrontendLogHandler = (logger: Pick<Logger, 'info' | 'error'>) => (req: Request, res: Response) => {
  const level = requestUtil.getStringParam(req, 'level');
  const logEntry = {
    ...req.body,
    source: 'frontend',
  };
  switch (level) {
    case 'info':
      logger.info(logEntry);
      break;
    case 'error':
      logger.error(logEntry);
      break;
    default:
      throw new ResponseError('BAD_REQUEST', `Unsupported log level: ${level}`);
  }
  res.sendStatus(200);
};

export { createFrontendLogHandler };
