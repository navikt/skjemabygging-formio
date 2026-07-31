import crypto from 'crypto';
import { powSolver, solvePow } from './powWorker';

const leadingZeroBits = (input: string): number => {
  const digest = crypto.createHash('sha256').update(input).digest();
  let bits = 0;
  for (let i = 0; i < digest.length; i++) {
    if (digest[i] === 0) {
      bits += 8;
    } else {
      bits += Math.clz32(digest[i]) - 24;
      break;
    }
  }
  return bits;
};

describe('powWorker', () => {
  it('solves a challenge so that SHA-256(nonce + ":" + solution) has enough leading zero bits', () => {
    const solution = powSolver('abc123', 12);
    expect(leadingZeroBits(`abc123:${solution}`)).toBeGreaterThanOrEqual(12);
  });

  it('uses a sha256 implementation which matches node crypto for messages of varying length', () => {
    // A wrong digest would make the solver return solutions the backend rejects
    for (const length of [0, 1, 31, 32, 54, 55, 56, 63, 64, 65, 200]) {
      const nonce = 'a'.repeat(length);
      const solution = powSolver(nonce, 4);
      expect(leadingZeroBits(`${nonce}:${solution}`)).toBeGreaterThanOrEqual(4);
    }
  });

  it('falls back to the main thread when web workers are unavailable', async () => {
    const solution = await solvePow('def456', 8);
    expect(leadingZeroBits(`def456:${solution}`)).toBeGreaterThanOrEqual(8);
  });

  it('solves the default difficulty of 16 bits quickly', () => {
    // Solving usually takes well below 100 ms, the generous limit only guards against a slow implementation
    const start = Date.now();
    powSolver(crypto.randomBytes(16).toString('hex'), 16);
    expect(Date.now() - start).toBeLessThan(3000);
  });
});
