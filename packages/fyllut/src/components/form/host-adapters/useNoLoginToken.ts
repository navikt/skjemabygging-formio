import { useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { useCallback, useState } from 'react';

const getTokenExpiration = (token: string) => {
  const payload = token.split('.')[1];
  if (!payload) {
    return undefined;
  }

  try {
    return (JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as { exp?: number }).exp;
  } catch {
    return undefined;
  }
};

const useNoLoginToken = () => {
  const { http, submissionMethod } = useAppConfig();
  const [token, setToken] = useState<string>();
  const [tokenExpiration, setTokenExpiration] = useState<number>();

  const getToken = useCallback(async () => {
    if (submissionMethod !== 'digitalnologin') {
      return undefined;
    }
    if (token) {
      return token;
    }

    const response = await http?.post<{ access_token?: string }>('/fyllut/api/captcha', { data_33: 'ja' });
    if (response?.access_token) {
      setToken(response.access_token);
      setTokenExpiration(getTokenExpiration(response.access_token));
    }
    return response?.access_token;
  }, [http, submissionMethod, token]);

  const clearToken = useCallback(() => setToken(undefined), []);

  return { getToken, clearToken, tokenExpiration };
};

export default useNoLoginToken;
