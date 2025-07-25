import { captchaService } from '../index';

vi.mock('../../utils/mathChallenge', () => ({
  createRandomMathChallenge: () => ({
    expression: '2 + 3',
    solution: '5',
  }),
}));

describe('Captcha service', () => {
  it('creates a new captcha challenge', async () => {
    const challenge = await captchaService.create();
    expect(challenge).toHaveProperty('id');
    expect(challenge).toHaveProperty('expression');
  });

  it('validates a correct captcha answer', async () => {
    const challenge = await captchaService.create();
    const isValid = await captchaService.validate(challenge.id, '5');
    expect(isValid).toBe(true);
  });

  it('fails to validate captcha if already answered', async () => {
    const challenge = await captchaService.create();
    const isValidFirstAttempt = await captchaService.validate(challenge.id, '5');
    expect(isValidFirstAttempt).toBe(true);
    const isValidSecondAttempt = await captchaService.validate(challenge.id, '5');
    expect(isValidSecondAttempt).toBe(false);
  });

  it('fails to validate an incorrect captcha answer', async () => {
    const challenge = await captchaService.create();
    const isValid = await captchaService.validate(challenge.id, '3');
    expect(isValid).toBe(false);
  });
});
