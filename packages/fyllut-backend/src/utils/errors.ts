import { logger } from '../logger';

export const logErrorWithStacktrace = (error: Error) => {
  const { message, stack, ...errDetails } = error;
  logger.error(message, { stack, ...errDetails });
};
