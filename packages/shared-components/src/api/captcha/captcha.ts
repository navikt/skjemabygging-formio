import baseHttp from '../util/http/http';
import { solvePow } from './powWorker';

interface CaptchaResponse {
  success: boolean;
  access_token?: string;
}

interface CaptchaChallenge {
  nonce: string;
  difficulty: number;
  expiresAt: number;
  signature: string;
}

interface SolvedCaptchaChallenge extends CaptchaChallenge {
  solution: string;
}

interface CaptchaValue {
  firstName?: string;
  // Solved up front by the Captcha component, so it is ready when the user submits
  pendingChallenge?: Promise<SolvedCaptchaChallenge | undefined>;
}

// Re-solve when the challenge is about to expire, to avoid submitting an expired solution
const EXPIRY_MARGIN_MS = 5000;

const fetchChallenge = async (http: typeof baseHttp = baseHttp): Promise<CaptchaChallenge> =>
  http.get<CaptchaChallenge>('/fyllut/api/captcha/challenge');

const solveChallenge = async (challenge: CaptchaChallenge): Promise<SolvedCaptchaChallenge> => ({
  ...challenge,
  solution: await solvePow(challenge.nonce, challenge.difficulty),
});

const createSolvedChallenge = async (http: typeof baseHttp = baseHttp): Promise<SolvedCaptchaChallenge> =>
  solveChallenge(await fetchChallenge(http));

const isUsable = (solvedChallenge?: SolvedCaptchaChallenge): solvedChallenge is SolvedCaptchaChallenge =>
  !!solvedChallenge && solvedChallenge.expiresAt - Date.now() > EXPIRY_MARGIN_MS;

const submitCaptchaValue = async (
  value: CaptchaValue,
  http?: typeof baseHttp,
): Promise<CaptchaResponse | undefined> => {
  if (!http) {
    return undefined;
  }
  let solvedChallenge = await value.pendingChallenge;
  if (!isUsable(solvedChallenge)) {
    solvedChallenge = await createSolvedChallenge(http).catch(() => undefined);
  }
  return http.post('/fyllut/api/captcha', {
    firstName: value.firstName ?? '',
    ...solvedChallenge,
  });
};

export { createSolvedChallenge, fetchChallenge, solveChallenge, submitCaptchaValue };
export type { CaptchaChallenge, CaptchaValue, SolvedCaptchaChallenge };
