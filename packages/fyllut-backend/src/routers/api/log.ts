import { Request, Response } from 'express';
import { logger } from '../../logger';

const log = {
  post: async (req: Request, res: Response) => {
    const { level } = req.params;
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
    return res.sendStatus(200);
  },
};

export default log;
