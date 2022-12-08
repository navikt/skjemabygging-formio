export class ErrorWithCause extends Error {
  cause: Error;
  constructor(message: string, cause: Error) {
    super(message);
    this.cause = cause;
  }
}
