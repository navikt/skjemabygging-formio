const CAPTCHA_FAILURE_REASON = {
  HONEYPOT_FILLED: 'honeypot_filled',
  INVALID_CHALLENGE_FIELDS: 'invalid_challenge_fields',
  INVALID_CHALLENGE_SIGNATURE: 'invalid_challenge_signature',
  CHALLENGE_EXPIRED: 'challenge_expired',
  INVALID_PROOF_OF_WORK: 'invalid_proof_of_work',
  UNEXPECTED_LEGACY_BODY: 'unexpected_legacy_body',
} as const;

type CaptchaFailureReason = (typeof CAPTCHA_FAILURE_REASON)[keyof typeof CAPTCHA_FAILURE_REASON];

const CAPTCHA_FAILURE_REASON_TEXT: Record<CaptchaFailureReason, string> = {
  [CAPTCHA_FAILURE_REASON.HONEYPOT_FILLED]: 'Honeypot was filled in',
  [CAPTCHA_FAILURE_REASON.INVALID_CHALLENGE_FIELDS]: 'Missing or invalid challenge fields',
  [CAPTCHA_FAILURE_REASON.INVALID_CHALLENGE_SIGNATURE]: 'Invalid challenge signature',
  [CAPTCHA_FAILURE_REASON.CHALLENGE_EXPIRED]: 'Challenge has expired',
  [CAPTCHA_FAILURE_REASON.INVALID_PROOF_OF_WORK]: 'Invalid proof of work solution',
  [CAPTCHA_FAILURE_REASON.UNEXPECTED_LEGACY_BODY]: 'Unexpected legacy captcha body',
};

class CaptchaError extends Error {
  constructor(readonly reason: CaptchaFailureReason) {
    super(`Captcha validation failed: ${CAPTCHA_FAILURE_REASON_TEXT[reason]}`);
  }
}

interface CaptchaChallenge {
  nonce: string;
  difficulty: number;
  expiresAt: number;
  signature: string;
}

interface CaptchaSolution extends CaptchaChallenge {
  solution: string;
}

export {
  CAPTCHA_FAILURE_REASON,
  CAPTCHA_FAILURE_REASON_TEXT,
  CaptchaError,
  type CaptchaChallenge,
  type CaptchaFailureReason,
  type CaptchaSolution,
};
