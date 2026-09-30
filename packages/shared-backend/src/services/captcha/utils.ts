import crypto from 'crypto';

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

export { solutionIsValid };
