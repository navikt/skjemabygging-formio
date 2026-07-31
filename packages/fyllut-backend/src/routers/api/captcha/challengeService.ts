import crypto from 'crypto';
import { config } from '../../../config/config';
import { CaptchaChallenge, CaptchaSolution } from './types';

const MAX_SOLUTION_LENGTH = 64;

/**
 * Canonical proof of work format: SHA-256(nonce + ":" + solution) must have at
 * least `difficulty` leading zero bits. The same format is implemented in the
 * frontend web worker (shared-components: src/api/captcha/powWorker.ts).
 */
const POW_SEPARATOR = ':';

const sign = (nonce: string, difficulty: number, expiresAt: number): string =>
  crypto.createHmac('sha256', config.captcha.hmacSecret).update(`${nonce}.${difficulty}.${expiresAt}`).digest('hex');

const createChallenge = (): CaptchaChallenge => {
  const nonce = crypto.randomBytes(16).toString('hex');
  const difficulty = config.captcha.powDifficulty;
  const expiresAt = Date.now() + config.captcha.challengeTtlSeconds * 1000;
  return { nonce, difficulty, expiresAt, signature: sign(nonce, difficulty, expiresAt) };
};

const signatureIsValid = ({ nonce, difficulty, expiresAt, signature }: CaptchaChallenge): boolean => {
  const expected = Buffer.from(sign(nonce, difficulty, expiresAt), 'utf-8');
  const actual = Buffer.from(signature, 'utf-8');
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
};

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

const isCaptchaSolution = (body: any): body is CaptchaSolution =>
  typeof body?.nonce === 'string' &&
  typeof body?.signature === 'string' &&
  typeof body?.solution === 'string' &&
  body.solution.length > 0 &&
  body.solution.length <= MAX_SOLUTION_LENGTH &&
  Number.isInteger(body?.difficulty) &&
  Number.isInteger(body?.expiresAt);

/**
 * Stateless verification of a challenge response. There is no replay store, since fyllut-backend runs
 * on multiple pods without shared memory. Replay is instead constrained by the short challenge ttl,
 * the rate limiter and the cost of solving the proof of work.
 */
const verifySolution = (body: any): { valid: true } | { valid: false; reason: string } => {
  if (!isCaptchaSolution(body)) {
    return { valid: false, reason: 'Missing or invalid challenge fields' };
  }
  if (!signatureIsValid(body)) {
    return { valid: false, reason: 'Invalid challenge signature' };
  }
  if (body.expiresAt < Date.now()) {
    return { valid: false, reason: 'Challenge has expired' };
  }
  if (!solutionIsValid(body.nonce, body.difficulty, body.solution)) {
    return { valid: false, reason: 'Invalid proof of work solution' };
  }
  return { valid: true };
};

export { createChallenge, verifySolution };
