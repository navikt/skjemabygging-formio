import {
  CAPTCHA_FAILURE_REASON as CAPTCHA_SERVICE_FAILURE_REASON,
  CaptchaFailureReason as CaptchaServiceFailureReason,
} from '@navikt/skjemadigitalisering-shared-backend';

const CAPTCHA_FAILURE_REASON = {
  HONEYPOT_FILLED: 'honeypot_filled',
  ...CAPTCHA_SERVICE_FAILURE_REASON,
} as const;

type CaptchaFailureReason = CaptchaServiceFailureReason | typeof CAPTCHA_FAILURE_REASON.HONEYPOT_FILLED;

const CAPTCHA_FAILURE_REASON_TEXT: Record<CaptchaFailureReason, string> = {
  [CAPTCHA_FAILURE_REASON.HONEYPOT_FILLED]: 'Honeypot was filled in',
  [CAPTCHA_FAILURE_REASON.INVALID_CHALLENGE_FIELDS]: 'Missing or invalid challenge fields',
  [CAPTCHA_FAILURE_REASON.INVALID_CHALLENGE_SIGNATURE]: 'Invalid challenge signature',
  [CAPTCHA_FAILURE_REASON.CHALLENGE_EXPIRED]: 'Challenge has expired',
  [CAPTCHA_FAILURE_REASON.INVALID_PROOF_OF_WORK]: 'Invalid proof of work solution',
};

class CaptchaError extends Error {
  constructor(readonly reason: CaptchaFailureReason) {
    super(`Captcha validation failed: ${CAPTCHA_FAILURE_REASON_TEXT[reason]}`);
  }
}

export {
  CAPTCHA_FAILURE_REASON,
  CAPTCHA_FAILURE_REASON_TEXT,
  CaptchaError,
  type CaptchaFailureReason,
};
