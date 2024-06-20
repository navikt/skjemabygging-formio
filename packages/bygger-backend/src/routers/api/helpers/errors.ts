export class HttpError extends Error {
  public readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message: string) {
    super(message, 401);
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string) {
    super(message, 404);
  }
}

export class BadRequest extends HttpError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class InternalServerError extends HttpError {
  constructor(message: string) {
    super(message, 500);
  }
}

export class ApiError extends Error {
  cause?: Error;
  functional: boolean;

  /**
   * @constructor
   * @param {string} message - message describing what went wrong
   * @param {boolean} functional - true if the message is intended for the user
   * @param {Error} cause - causing error
   */
  constructor(message: string, functional: boolean, cause?: Error) {
    super(message);
    this.functional = functional;
    this.cause = cause;
    this.name = 'ApiError';
  }
}
