export class CaptchaError extends Error {
  constructor(readonly reason: string) {
    super(`Captcha validation failed: ${reason}`);
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
