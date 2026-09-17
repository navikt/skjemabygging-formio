import type { CaptchaChallenge, SolvedCaptchaChallenge } from '@navikt/skjemadigitalisering-shared-domain';
import crypto from 'crypto';

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
  verifySolution: (
    body: unknown,
  ) => { valid: true } | { valid: false; reason: CaptchaFailureReason };
};

const MAX_SOLUTION_LENGTH = 64;

/**
 * Canonical proof of work format: SHA-256(nonce + ":" + solution) must have at
 * least `difficulty` leading zero bits. The same format is implemented in the
 * frontend web worker (shared-components: src/api/captcha/powWorker.ts).
 */
const POW_SEPARATOR = ':';

const countLeadingZeroBits = (digest: Buffer): number => {
  let bits = 0;
  for (let i = 0; i < digest.length; i++) {
    const byte = digest[i];
    if (byte === 0) {
      bits += 8;
    } else {
      // Math.clz32 counts leading zeros in a 32 bit integer, subtract the 24 padding bits
      bits += Math.clz32(byte) - 24;
      break;
    }
  }
  return bits;
};

const solutionIsValid = (nonce: string, difficulty: number, solution: string): boolean => {
  const digest = crypto.createHash('sha256').update(`${nonce}${POW_SEPARATOR}${solution}`).digest();
  return countLeadingZeroBits(digest) >= difficulty;
};

/**
 * Stateless verification of a challenge response. There is no replay store, since consumers can run
 * on multiple pods without shared memory. Replay is instead constrained by the short challenge ttl,
 * application-owned rate limiting and the cost of solving the proof of work.
 */
const createCaptchaService = ({
  hmacSecret,
  powDifficulty,
  challengeTtlSeconds,
}: CreateCaptchaServiceProps): CaptchaService => {
  const sign = (nonce: string, difficulty: number, expiresAt: number): string =>
    crypto.createHmac('sha256', hmacSecret).update(`${nonce}.${difficulty}.${expiresAt}`).digest('hex');

  const createChallenge = (): CaptchaChallenge => {
    const nonce = crypto.randomBytes(16).toString('hex');
    const difficulty = powDifficulty;
    const expiresAt = Date.now() + challengeTtlSeconds * 1000;
    return { nonce, difficulty, expiresAt, signature: sign(nonce, difficulty, expiresAt) };
  };

  const signatureIsValid = ({ nonce, difficulty, expiresAt, signature }: CaptchaChallenge): boolean => {
    const expected = Buffer.from(sign(nonce, difficulty, expiresAt), 'utf-8');
    const actual = Buffer.from(signature, 'utf-8');
    return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
  };

  const isCaptchaSolution = (body: unknown): body is SolvedCaptchaChallenge => {
    if (typeof body !== 'object' || body === null) {
      return false;
    }
    const candidate = body as Partial<SolvedCaptchaChallenge>;
    return (
      typeof candidate.nonce === 'string' &&
      typeof candidate.signature === 'string' &&
      typeof candidate.solution === 'string' &&
      candidate.solution.length > 0 &&
      candidate.solution.length <= MAX_SOLUTION_LENGTH &&
      Number.isInteger(candidate.difficulty) &&
      Number.isInteger(candidate.expiresAt)
    );
  };

  const verifySolution = (
    body: unknown,
  ): { valid: true } | { valid: false; reason: CaptchaFailureReason } => {
    if (!isCaptchaSolution(body)) {
      return { valid: false, reason: CAPTCHA_FAILURE_REASON.INVALID_CHALLENGE_FIELDS };
    }
    if (!signatureIsValid(body)) {
      return { valid: false, reason: CAPTCHA_FAILURE_REASON.INVALID_CHALLENGE_SIGNATURE };
    }
    if (body.expiresAt < Date.now()) {
      return { valid: false, reason: CAPTCHA_FAILURE_REASON.CHALLENGE_EXPIRED };
    }
    if (!solutionIsValid(body.nonce, body.difficulty, body.solution)) {
      return { valid: false, reason: CAPTCHA_FAILURE_REASON.INVALID_PROOF_OF_WORK };
    }
    return { valid: true };
  };

  return { createChallenge, verifySolution };
};

export { CAPTCHA_FAILURE_REASON, createCaptchaService };
export type { CaptchaFailureReason, CaptchaService, CreateCaptchaServiceProps };
