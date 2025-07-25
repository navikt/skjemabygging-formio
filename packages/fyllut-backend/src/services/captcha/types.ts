import { UUID } from 'node:crypto';

export type CaptchaService = {
  create: () => Promise<CaptchaChallenge>;
  validate: (id: UUID, answer: string) => Promise<boolean>;
};

export type CaptchaChallenge = {
  id: UUID;
  expression: string;
};
