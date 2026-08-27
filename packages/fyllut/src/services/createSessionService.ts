import { FyllutHttp, SessionService } from '@navikt/skjemadigitalisering-shared-frontend';

interface Props {
  http: FyllutHttp;
  backendBaseUrl: string;
}

const createSessionService = ({ http, backendBaseUrl }: Props): SessionService => ({
  createNoLoginToken: async ({ honeypot } = {}) => {
    const response = await http.post<{ access_token?: string }>(`${backendBaseUrl}/api/captcha`, {
      firstName: honeypot ?? '',
      data_33: 'ja',
    });
    return response.access_token;
  },
  isAuthenticationError: (error) => http.isAuthenticationError(error),
});

export default createSessionService;
