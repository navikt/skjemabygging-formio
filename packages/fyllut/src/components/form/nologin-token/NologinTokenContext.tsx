import { useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

interface NologinTokenContextType {
  getNologinToken: () => Promise<string | undefined>;
  clearNologinToken: () => void;
  tokenExpiration?: number;
}

const NologinTokenContext = createContext<NologinTokenContextType>({
  getNologinToken: async () => undefined,
  clearNologinToken: () => {},
  tokenExpiration: undefined,
});

const NologinTokenProvider = ({ children }: { children: ReactNode }) => {
  const { http, submissionMethod } = useAppConfig();
  const [nologinToken, setNologinToken] = useState<string | undefined>();
  const [tokenExpiration, setTokenExpiration] = useState<number | undefined>();

  const getTokenExpiration = (token: string) => {
    const payload = token.split('.')[1];
    if (!payload) {
      return undefined;
    }

    try {
      const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as { exp?: number };
      return decoded.exp;
    } catch {
      return undefined;
    }
  };

  const getNologinToken = useCallback(async () => {
    if (submissionMethod !== 'digitalnologin') {
      return undefined;
    }

    if (nologinToken) {
      return nologinToken;
    }

    const response = await http?.post<{ access_token?: string }>('/fyllut/api/captcha', { data_33: 'ja' });
    if (response?.access_token) {
      setNologinToken(response.access_token);
      setTokenExpiration(getTokenExpiration(response.access_token));
    }

    return response?.access_token;
  }, [http, nologinToken, submissionMethod]);

  const clearNologinToken = useCallback(() => {
    setNologinToken(undefined);
  }, []);

  const value = useMemo(
    () => ({
      getNologinToken,
      clearNologinToken,
      tokenExpiration,
    }),
    [clearNologinToken, getNologinToken, tokenExpiration],
  );

  return <NologinTokenContext.Provider value={value}>{children}</NologinTokenContext.Provider>;
};

const useNologinToken = () => useContext(NologinTokenContext);

export { NologinTokenProvider, useNologinToken };
