export class CaptchaError extends Error {
  reqBody: string;
  constructor(message: string, reqBody: any) {
    super(message);
    this.reqBody = reqBody;
  }
}
