import { UUID } from 'node:crypto';
import { logger } from '../../logger';
import { createRandomMathChallenge, MathChallenge } from '../../utils/mathChallenge';
import { Cache, CacheId } from '../cache/types';
import { CaptchaChallenge, CaptchaService } from './types';

const KEY_PREFIX = `${CacheId.captcha}:`;

const createCaptchaService: (cache: Cache) => CaptchaService = (cache: Cache) => ({
  create: async (): Promise<CaptchaChallenge> => {
    const captchaId: UUID = crypto.randomUUID();
    const challenge = createRandomMathChallenge();
    await cache.set(`${KEY_PREFIX}${captchaId}`, JSON.stringify(challenge), 300); // Store for 5 minutes
    return { id: captchaId, expression: challenge.expression };
  },

  validate: async (captchaId: UUID, answer: string) => {
    const cacheData = await cache.get(`${KEY_PREFIX}${captchaId}`);
    if (!cacheData) {
      logger.info('Captcha not found or expired');
      return false;
    }
    const challenge = JSON.parse(cacheData) as MathChallenge;
    const correct = challenge.solution === answer;
    if (correct) {
      await cache.del(`${KEY_PREFIX}${captchaId}`);
    }
    return correct;
  },
});

export { createCaptchaService };
