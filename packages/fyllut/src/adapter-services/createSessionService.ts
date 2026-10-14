import { IntegrationHttp, SessionService, solvePow } from '@navikt/skjemadigitalisering-shared-frontend';

interface Props {
  http: IntegrationHttp;
  backendBaseUrl: string;
}

interface CaptchaChallenge {
  nonce: string;
  difficulty: number;
  expiresAt: number;
  signature: string;
}

const createSessionService = ({ http, backendBaseUrl }: Props): SessionService => ({
  createNoLoginToken: async ({ honeypot } = {}) => {
    const challenge = await http.get<CaptchaChallenge>(`${backendBaseUrl}/api/captcha/challenge`);
    const solution = await solvePow(challenge.nonce, challenge.difficulty);
    const response = await http.post<{ access_token?: string }>(`${backendBaseUrl}/api/captcha`, {
      firstName: honeypot ?? '',
      ...challenge,
      solution,
    });
    return response.access_token;
  },
  isAuthenticationError: (error) => http.isAuthenticationError(error),
});

export default createSessionService;
