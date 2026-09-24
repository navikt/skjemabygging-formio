import type { CaptchaChallenge, SolvedCaptchaChallenge } from '@navikt/skjemadigitalisering-shared-domain';
import crypto from 'crypto';
import { CAPTCHA_FAILURE_REASON, createCaptchaService } from './captchaService';

const hmacSecret = 'captcha-test-secret';
const powDifficulty = 8;
const challengeTtlSeconds = 60;

const captchaService = createCaptchaService({
  hmacSecret,
  powDifficulty,
  challengeTtlSeconds,
});

const solutionIsValid = (challenge: CaptchaChallenge, solution: string): boolean => {
  const digest = crypto.createHash('sha256').update(`${challenge.nonce}:${solution}`).digest();
  let bits = 0;
  for (let byteIndex = 0; byteIndex < digest.length; byteIndex++) {
    const byte = digest[byteIndex];
    if (byte === 0) {
      bits += 8;
    } else {
      bits += Math.clz32(byte) - 24;
      break;
    }
  }
  return bits >= challenge.difficulty;
};

const solveChallenge = (challenge: CaptchaChallenge): SolvedCaptchaChallenge => {
  for (let i = 0; i < 10_000_000; i++) {
    const solution = i.toString(36);
    if (solutionIsValid(challenge, solution)) {
      return { ...challenge, solution };
    }
  }
  throw new Error('Unable to solve challenge');
};

const findInvalidSolution = (challenge: CaptchaChallenge): string => {
  for (let i = 0; ; i++) {
    const solution = i.toString(36);
    if (!solutionIsValid(challenge, solution)) {
      return solution;
    }
  }
};

const signChallenge = ({ nonce, difficulty, expiresAt }: Omit<CaptchaChallenge, 'signature'>): string =>
  crypto.createHmac('sha256', hmacSecret).update(`${nonce}.${difficulty}.${expiresAt}`).digest('hex');

describe('createCaptchaService', () => {
  it('creates a signed challenge with the configured difficulty and lifetime', () => {
    const beforeCreation = Date.now();

    const challenge = captchaService.createChallenge();

    expect(challenge.nonce).toHaveLength(32);
    expect(challenge.difficulty).toBe(powDifficulty);
    expect(challenge.expiresAt).toBeGreaterThanOrEqual(beforeCreation + challengeTtlSeconds * 1000);
    expect(challenge.signature).toBe(
      signChallenge({
        nonce: challenge.nonce,
        difficulty: challenge.difficulty,
        expiresAt: challenge.expiresAt,
      }),
    );
  });

  it('accepts a valid proof-of-work solution', () => {
    const solution = solveChallenge(captchaService.createChallenge());

    expect(captchaService.verifySolution(solution)).toEqual({ valid: true });
  });

  it('rejects missing or invalid challenge fields', () => {
    expect(captchaService.verifySolution({})).toEqual({
      valid: false,
      reason: CAPTCHA_FAILURE_REASON.INVALID_CHALLENGE_FIELDS,
    });
  });

  it('rejects a tampered challenge signature', () => {
    const solution = solveChallenge({ ...captchaService.createChallenge(), difficulty: 1 });

    expect(captchaService.verifySolution(solution)).toEqual({
      valid: false,
      reason: CAPTCHA_FAILURE_REASON.INVALID_CHALLENGE_SIGNATURE,
    });
  });

  it('rejects an expired challenge', () => {
    const expiresAt = Date.now() - 1000;
    const challenge = {
      nonce: crypto.randomBytes(16).toString('hex'),
      difficulty: powDifficulty,
      expiresAt,
    };
    const solution = solveChallenge({ ...challenge, signature: signChallenge(challenge) });

    expect(captchaService.verifySolution(solution)).toEqual({
      valid: false,
      reason: CAPTCHA_FAILURE_REASON.CHALLENGE_EXPIRED,
    });
  });

  it('rejects an invalid proof-of-work solution', () => {
    const challenge = captchaService.createChallenge();

    expect(captchaService.verifySolution({ ...challenge, solution: findInvalidSolution(challenge) })).toEqual({
      valid: false,
      reason: CAPTCHA_FAILURE_REASON.INVALID_PROOF_OF_WORK,
    });
  });
});
