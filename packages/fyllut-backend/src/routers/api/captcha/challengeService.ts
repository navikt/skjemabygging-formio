import crypto from 'crypto';
import { config } from '../../../config/config';
import { CAPTCHA_FAILURE_REASON, CaptchaChallenge, CaptchaFailureReason, CaptchaSolution } from './types';

const MAX_SOLUTION_LENGTH = 64;

/**
 * Canonical proof of work format: SHA-256(nonce + ":" + solution) must have at
 * least `difficulty` leading zero bits. The same format is implemented in the
 * frontend web worker (shared-components: src/api/captcha/powWorker.ts).
 */
const POW_SEPARATOR = ':';

/**
 * Normalizes the client address so the same client produces the same binding for both the
 * challenge request and the solution request. IPv4 addresses may be reported in IPv4-mapped
 * IPv6 form (::ffff:127.0.0.1) depending on how the socket was established.
 */
const normalizeClientAddress = (clientAddress?: string): string =>
  (clientAddress ?? '')
    .trim()
    .toLowerCase()
    .replace(/^::ffff:/, '');

/**
 * The client address is an input to the signature only, never part of the challenge sent to the
 * client, so no address is put on the wire or in a log. Binding makes a solved challenge usable
 * only from the address that requested it, so solutions cannot be produced centrally and spread
 * across a proxy pool to bypass the per-address rate limiter.
 *
 * NB! This relies on `req.ip` being the actual client address. See the `trust proxy` setting.
 */
const sign = (nonce: string, difficulty: number, expiresAt: number, clientAddress?: string): string =>
  crypto
    .createHmac('sha256', config.captcha.hmacSecret)
    .update(`${nonce}.${difficulty}.${expiresAt}.${normalizeClientAddress(clientAddress)}`)
    .digest('hex');

const createChallenge = (clientAddress?: string): CaptchaChallenge => {
  const nonce = crypto.randomBytes(16).toString('hex');
  const difficulty = config.captcha.powDifficulty;
  const expiresAt = Date.now() + config.captcha.challengeTtlSeconds * 1000;
  return { nonce, difficulty, expiresAt, signature: sign(nonce, difficulty, expiresAt, clientAddress) };
};

const signatureIsValid = (
  { nonce, difficulty, expiresAt, signature }: CaptchaChallenge,
  clientAddress?: string,
): boolean => {
  const expected = Buffer.from(sign(nonce, difficulty, expiresAt, clientAddress), 'utf-8');
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
 * the rate limiter, the client address bound into the signature and the cost of solving the proof of work.
 */
const verifySolution = (
  body: any,
  clientAddress?: string,
): { valid: true } | { valid: false; reason: CaptchaFailureReason } => {
  if (!isCaptchaSolution(body)) {
    return { valid: false, reason: CAPTCHA_FAILURE_REASON.INVALID_CHALLENGE_FIELDS };
  }
  if (!signatureIsValid(body, clientAddress)) {
    // Also covers a challenge solved for a different client address
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

export { createChallenge, verifySolution };
