import type { CaptchaChallenge, SolvedCaptchaChallenge } from '@navikt/skjemadigitalisering-shared-domain';
import crypto from 'crypto';
import {
  CAPTCHA_FAILURE_REASON,
  type CaptchaFailureReason,
  type CaptchaService,
  type CreateCaptchaServiceProps,
} from './types';
import { solutionIsValid } from './utils';

const MAX_SOLUTION_LENGTH = 64;

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

  const verifySolution = (body: unknown): { valid: true } | { valid: false; reason: CaptchaFailureReason } => {
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

export type { CaptchaFailureReason, CaptchaService, CreateCaptchaServiceProps } from './types';
export { CAPTCHA_FAILURE_REASON, createCaptchaService };
