import type { Request, Response } from 'express';
import requestUtil from '../../util/request/requestUtil';
import type { AppLogger } from '../types';

const createFrontendLogHandler =
  (logger: Pick<AppLogger, 'info' | 'error'>) =>
  async (req: Request, res: Response): Promise<void> => {
    const level = requestUtil.getStringParam(req, 'level')!;
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
        res.status(400).json({ message: `Unsupported log level: ${level}` });
        return;
    }
    res.sendStatus(200);
  };

export { createFrontendLogHandler };
