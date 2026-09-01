import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import crypto from 'crypto';
import { Express } from 'express';
import request from 'supertest';
import { createApp } from '../../../app';
import { config } from '../../../config/config';
import { logger } from '../../../logger';
import { CaptchaChallenge, CaptchaSolution } from './types';

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

const solveChallenge = (challenge: CaptchaChallenge): CaptchaSolution => {
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

describe('Captcha Handler Tests', () => {
  let app: Express;
  const defaultPowEnabled = config.captcha.powEnabled;
  const defaultPowDifficulty = config.captcha.powDifficulty;

  afterEach(() => {
    config.captcha.powEnabled = defaultPowEnabled;
    config.captcha.powDifficulty = defaultPowDifficulty;
    vi.restoreAllMocks();
  });

  beforeEach(async () => {
    app = createApp();
  });

  describe('Proof of work flow', () => {
    let challenge: CaptchaChallenge;

    const fetchChallenge = async (): Promise<CaptchaChallenge> => {
      const response = await request(app).get('/fyllut/api/captcha/challenge').expect(200);
      return response.body;
    };

    beforeEach(async () => {
      config.captcha.powEnabled = true;
      // Keeps solving fast and deterministic in tests
      config.captcha.powDifficulty = 8;
      challenge = await fetchChallenge();
    });

    it('returns a signed challenge', () => {
      expect(challenge.nonce).toHaveLength(32);
      expect(challenge.difficulty).toBe(config.captcha.powDifficulty);
      expect(challenge.signature).toBeDefined();
      expect(challenge.expiresAt).toBeGreaterThan(Date.now());
    });

    it('returns 200 with access_token when the solution is valid', async () => {
      await request(app)
        .post('/fyllut/api/captcha')
        .set('Origin', 'https://www.nav.no')
        .send({ firstName: '', ...solveChallenge(challenge) })
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
          expect(res.body.access_token).toBeDefined();
        });
    });

    it('fails when the solution is incorrect', async () => {
      const invalidSolution = findInvalidSolution(challenge);

      await request(app)
        .post('/fyllut/api/captcha')
        .set('Origin', 'https://www.nav.no')
        .send({ firstName: '', ...challenge, solution: invalidSolution })
        .expect('Content-Type', /json/)
        .expect(400);
    });

    it('fails when the signature has been tampered with', async () => {
      const logInfo = vi.spyOn(logger, 'info');
      const tampered = solveChallenge({ ...challenge, difficulty: 1 });
      await request(app)
        .post('/fyllut/api/captcha')
        .set('Origin', 'https://www.nav.no')
        .send({ firstName: '', ...tampered })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(logInfo).toHaveBeenCalledWith('Captcha validation failed', { reason: 'Invalid challenge signature' });
      expect(JSON.stringify(logInfo.mock.calls)).not.toContain(tampered.nonce);
      expect(JSON.stringify(logInfo.mock.calls)).not.toContain(tampered.signature);
      expect(JSON.stringify(logInfo.mock.calls)).not.toContain(tampered.solution);
    });

    it('fails when the challenge has expired', async () => {
      const expiresAt = Date.now() - 1000;
      const signature = crypto
        .createHmac('sha256', config.captcha.hmacSecret)
        .update(`${challenge.nonce}.${challenge.difficulty}.${expiresAt}`)
        .digest('hex');
      const expired = solveChallenge({ ...challenge, expiresAt, signature });
      await request(app)
        .post('/fyllut/api/captcha')
        .set('Origin', 'https://www.nav.no')
        .send({ firstName: '', ...expired })
        .expect('Content-Type', /json/)
        .expect(400);
    });

    it('fails if body is empty', async () => {
      await request(app)
        .post('/fyllut/api/captcha')
        .set('Origin', 'https://www.nav.no')
        .send({})
        .expect('Content-Type', /json/)
        .expect(400);
    });

    it('fails if firstName is present', async () => {
      await request(app)
        .post('/fyllut/api/captcha')
        .set('Origin', 'https://www.nav.no')
        .send({ ...solveChallenge(challenge), firstName: 'Roar' })
        .expect('Content-Type', /json/)
        .expect(400)
        .expect((res) => {
          expect(res.body.errorCode).toBe('BAD_REQUEST');
          expect(res.body.userMessage).toBe(TEXTS.statiske.uploadFile.uploadFileError);
        });
    });

    it('returns 403 when origin is not allowed', async () => {
      await request(app)
        .post('/fyllut/api/captcha')
        .set('Origin', 'https://www.suspicious-site.com')
        .send({ firstName: '', ...solveChallenge(challenge) })
        .expect(403);
    });
  });

  // TODO: remove old data_33 flow after PoW confirmed stable in production
  describe('Legacy flow (CAPTCHA_USE_POW disabled)', () => {
    const validCaptchaData = { firstName: '', data_33: 'ja' };

    beforeEach(() => {
      config.captcha.powEnabled = false;
    });

    it('returns 200 with access_token if valid data is provided', async () => {
      await request(app)
        .post('/fyllut/api/captcha')
        .set('Origin', 'https://www.nav.no')
        .send(validCaptchaData)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
          expect(res.body.access_token).toBeDefined();
        });
    });

    it('fails if challenge answer is incorrect', async () => {
      await request(app)
        .post('/fyllut/api/captcha')
        .set('Origin', 'https://www.nav.no')
        .send({ ...validCaptchaData, data_33: 'Test' })
        .expect('Content-Type', /json/)
        .expect(400);
    });

    it('fails if firstName is present', async () => {
      await request(app)
        .post('/fyllut/api/captcha')
        .set('Origin', 'https://www.nav.no')
        .send({ ...validCaptchaData, firstName: 'Roar' })
        .expect('Content-Type', /json/)
        .expect(400);
    });
  });
});
