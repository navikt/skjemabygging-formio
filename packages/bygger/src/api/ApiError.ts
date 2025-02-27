export default class ApiError extends Error {
  public readonly httpStatus;
  constructor(status: number, message?: string) {
    super(message);
    this.httpStatus = status;
  }
}
