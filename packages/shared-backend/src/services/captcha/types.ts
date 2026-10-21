import type { CaptchaChallenge } from '@navikt/skjemadigitalisering-shared-domain';

const CAPTCHA_FAILURE_REASON = {
  INVALID_CHALLENGE_FIELDS: 'invalid_challenge_fields',
  INVALID_CHALLENGE_SIGNATURE: 'invalid_challenge_signature',
  CHALLENGE_EXPIRED: 'challenge_expired',
  INVALID_PROOF_OF_WORK: 'invalid_proof_of_work',
} as const;

type CaptchaFailureReason = (typeof CAPTCHA_FAILURE_REASON)[keyof typeof CAPTCHA_FAILURE_REASON];

interface CreateCaptchaServiceProps {
  hmacSecret: string;
  powDifficulty: number;
  challengeTtlSeconds: number;
}

type CaptchaService = {
  createChallenge: () => CaptchaChallenge;
  verifySolution: (body: unknown) => { valid: true } | { valid: false; reason: CaptchaFailureReason };
};

export { CAPTCHA_FAILURE_REASON };
export type { CaptchaFailureReason, CaptchaService, CreateCaptchaServiceProps };
