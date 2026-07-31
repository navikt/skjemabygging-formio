export class CaptchaError extends Error {
  reqBody: string;
  constructor(message: string, reqBody: any) {
    super(message);
    this.reqBody = reqBody;
  }
}

export interface CaptchaChallenge {
  nonce: string;
  difficulty: number;
  expiresAt: number;
  signature: string;
}

export interface CaptchaSolution extends CaptchaChallenge {
  solution: string;
}
