import { logger } from '../logger';

export class ErrorWithCause extends Error {
  cause: Error;
  constructor(message: string, cause: Error) {
    super(message);
    this.cause = cause;
  }
}

export const logErrorWithStacktrace = (error: any) => {
  const { message, cause, stack, ...errDetails } = error;
  logger.error(message, { stack, cause, ...errDetails });
};
