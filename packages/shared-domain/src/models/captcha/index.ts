interface CaptchaChallenge {
  nonce: string;
  difficulty: number;
  expiresAt: number;
  signature: string;
}

interface SolvedCaptchaChallenge extends CaptchaChallenge {
  solution: string;
}

export type { CaptchaChallenge, SolvedCaptchaChallenge };
