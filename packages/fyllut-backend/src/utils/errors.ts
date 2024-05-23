import { logger } from '../logger';

export class ErrorWithCause extends Error {
  cause: Error;
  constructor(message: string, cause: Error) {
    super(message);
    this.cause = cause;
  }
}

export const logErrorWithStacktrace = (error: Error) => {
  const { message, stack, ...errDetails } = error;
  logger.error(message, { stack, ...errDetails });
};
