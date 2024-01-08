import { Response } from 'express';
import { logger } from '../../logging/logger';
import { ByggerRequest } from '../../types';

const log = async (req: ByggerRequest, res: Response) => {
  const { level } = req.params;
  const { message, metadata } = req.body;
  const logMeta = {
    ...metadata,
    source: 'frontend',
  };
  switch (level) {
    case 'info':
      logger.info(message, logMeta);
      break;
    case 'error':
      logger.error(message, logMeta);
      break;
    default:
      res.status(400).json({ message: `Unsupported log level: ${level}` });
  }

  return res.sendStatus(200);
};

export default log;
