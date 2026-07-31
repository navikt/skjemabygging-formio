/**
 * Solves the proof of work challenge issued by fyllut-backend.
 *
 * Canonical format: find a `solution` such that SHA-256(nonce + ":" + solution)
 * has at least `difficulty` leading zero bits. The same format is implemented in
 * the backend verifier (fyllut-backend: src/routers/api/captcha/challengeService.ts).
 *
 * SHA-256 is implemented inline instead of using crypto.subtle.digest, which is
 * asynchronous and adds ~85µs of overhead per call. That would make a 16 bit
 * challenge take several seconds instead of a few hundred milliseconds.
 *
 * NB! This function is stringified and executed inside a web worker, so it must be
 * self contained and cannot reference anything outside its own scope.
 */
const powSolver = (nonce: string, difficulty: number): string => {
  const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98,
    0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
    0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8,
    0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819,
    0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
    0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7,
    0xc67178f2,
  ]);
  const w = new Uint32Array(64);
  const MAX_SOLUTION_LENGTH = 12;

  const prefix = new TextEncoder().encode(`${nonce}:`);
  const buffer = new Uint8Array((((prefix.length + MAX_SOLUTION_LENGTH + 8) >> 6) + 1) << 6);
  const view = new DataView(buffer.buffer);
  buffer.set(prefix);

  // Returns the first 32 bits of the digest, which is all that is needed to count leading zero bits
  const sha256FirstWord = (blocksLength: number): number => {
    let h0 = 0x6a09e667;
    let h1 = 0xbb67ae85;
    let h2 = 0x3c6ef372;
    let h3 = 0xa54ff53a;
    let h4 = 0x510e527f;
    let h5 = 0x9b05688c;
    let h6 = 0x1f83d9ab;
    let h7 = 0x5be0cd19;

    for (let offset = 0; offset < blocksLength; offset += 64) {
      for (let i = 0; i < 16; i++) {
        w[i] = view.getUint32(offset + i * 4);
      }
      for (let i = 16; i < 64; i++) {
        const x = w[i - 15];
        const y = w[i - 2];
        const s0 = ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3);
        const s1 = ((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      }

      let a = h0;
      let b = h1;
      let c = h2;
      let d = h3;
      let e = h4;
      let f = h5;
      let g = h6;
      let h = h7;

      for (let i = 0; i < 64; i++) {
        const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
        const ch = (e & f) ^ (~e & g);
        const temp1 = (h + S1 + ch + K[i] + w[i]) | 0;
        const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const temp2 = (S0 + maj) | 0;
        h = g;
        g = f;
        f = e;
        e = (d + temp1) | 0;
        d = c;
        c = b;
        b = a;
        a = (temp1 + temp2) | 0;
      }

      h0 = (h0 + a) | 0;
      h1 = (h1 + b) | 0;
      h2 = (h2 + c) | 0;
      h3 = (h3 + d) | 0;
      h4 = (h4 + e) | 0;
      h5 = (h5 + f) | 0;
      h6 = (h6 + g) | 0;
      h7 = (h7 + h) | 0;
    }
    return h0 >>> 0;
  };

  const maxIterations = 16777216;
  for (let attempt = 0; attempt < maxIterations; attempt++) {
    const solution = attempt.toString(36);
    let length = prefix.length;
    for (let i = 0; i < solution.length; i++) {
      buffer[length++] = solution.charCodeAt(i);
    }
    const paddedLength = (((length + 8) >> 6) + 1) << 6;
    buffer.fill(0, length, paddedLength);
    buffer[length] = 0x80;
    view.setUint32(paddedLength - 4, length * 8);
    if (Math.clz32(sha256FirstWord(paddedLength)) >= difficulty) {
      return solution;
    }
  }
  throw new Error('Unable to solve captcha challenge');
};

// Built from powSolver to keep a single implementation of the algorithm
const workerSource = `
const powSolver = ${powSolver.toString()};
self.onmessage = (event) => {
  try {
    const { nonce, difficulty } = event.data;
    self.postMessage({ solution: powSolver(nonce, difficulty) });
  } catch (error) {
    self.postMessage({ error: error instanceof Error ? error.message : String(error) });
  }
};`;

const solveInWorker = (nonce: string, difficulty: number): Promise<string> =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(new Blob([workerSource], { type: 'application/javascript' }));
    const worker = new Worker(objectUrl);
    const cleanup = () => {
      worker.terminate();
      URL.revokeObjectURL(objectUrl);
    };
    worker.onmessage = (event: MessageEvent<{ solution?: string; error?: string }>) => {
      cleanup();
      if (event.data?.solution) {
        resolve(event.data.solution);
      } else {
        reject(new Error(event.data?.error ?? 'Unable to solve captcha challenge'));
      }
    };
    worker.onerror = () => {
      cleanup();
      // Fall back to the main thread, e.g. if the worker is blocked by a content security policy
      resolve(powSolver(nonce, difficulty));
    };
    worker.postMessage({ nonce, difficulty });
  });

const solvePow = async (nonce: string, difficulty: number): Promise<string> => {
  if (typeof Worker === 'undefined' || typeof URL.createObjectURL !== 'function') {
    return powSolver(nonce, difficulty);
  }
  try {
    return await solveInWorker(nonce, difficulty);
  } catch {
    return powSolver(nonce, difficulty);
  }
};

export { powSolver, solvePow };
