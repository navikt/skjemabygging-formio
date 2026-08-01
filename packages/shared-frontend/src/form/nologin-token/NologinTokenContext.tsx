import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useFyllutAppConfig } from '../../context/fyllut/FyllutAppConfigContext';

interface NologinTokenContextType {
  getNologinToken: () => Promise<string | undefined>;
  clearNologinToken: () => void;
  handleSessionExpired: () => void;
  tokenExpiration?: number;
}

const NologinTokenContext = createContext<NologinTokenContextType>({
  getNologinToken: async () => undefined,
  clearNologinToken: () => {},
  handleSessionExpired: () => {},
  tokenExpiration: undefined,
});

interface Props {
  children: ReactNode;
  form: Pick<Form, 'path' | 'properties' | 'title'>;
  initialToken?: string;
}

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

const NologinTokenProvider = ({ children, form, initialToken }: Props) => {
  const { http, logger, logEvent, submissionMethod } = useFyllutAppConfig();
  const navigate = useNavigate();
  const [nologinToken, setNologinToken] = useState<string | undefined>(initialToken);
  const [tokenExpiration, setTokenExpiration] = useState<number | undefined>(() =>
    initialToken ? getTokenExpiration(initialToken) : undefined,
  );
  const tokenRequestRef = useRef<Promise<string | undefined>>();

  const getNologinToken = useCallback(async () => {
    if (submissionMethod !== 'digitalnologin') {
      return undefined;
    }

    if (nologinToken) {
      return nologinToken;
    }

    if (tokenRequestRef.current) {
      return tokenRequestRef.current;
    }

    const tokenRequest = (async () => {
      const response = await http?.post<{ access_token?: string }>('/fyllut/api/captcha', { data_33: 'ja' });
      if (response?.access_token) {
        setNologinToken(response.access_token);
        setTokenExpiration(getTokenExpiration(response.access_token));
      }

      return response?.access_token;
    })();
    tokenRequestRef.current = tokenRequest;

    try {
      return await tokenRequest;
    } finally {
      if (tokenRequestRef.current === tokenRequest) {
        tokenRequestRef.current = undefined;
      }
    }
  }, [http, nologinToken, submissionMethod]);

  const clearNologinToken = useCallback(() => {
    setNologinToken(undefined);
    setTokenExpiration(undefined);
  }, []);

  const handleSessionExpired = useCallback(() => {
    logger?.debug?.('Session has expired, redirecting to session expired page');
    void logEvent?.({
      name: 'sesjon utløpt',
      data: {
        skjemaId: form.properties.skjemanummer,
        skjemanavn: form.title,
        tema: form.properties.tema,
        submissionMethod,
      },
    });
    clearNologinToken();
    navigate(`/sesjon-utlopt?form_path=${form.path}&form_number=${form.properties.skjemanummer}`);
  }, [clearNologinToken, form, logEvent, logger, navigate, submissionMethod]);

  useEffect(() => {
    if (!tokenExpiration) {
      return;
    }

    const millisecondsUntilExpiration = tokenExpiration * 1000 - Date.now();
    if (millisecondsUntilExpiration <= 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleSessionExpired();
      return;
    }

    const timeoutId = window.setTimeout(handleSessionExpired, millisecondsUntilExpiration);
    return () => window.clearTimeout(timeoutId);
  }, [handleSessionExpired, tokenExpiration]);

  const value = useMemo(
    () => ({
      getNologinToken,
      clearNologinToken,
      handleSessionExpired,
      tokenExpiration,
    }),
    [clearNologinToken, getNologinToken, handleSessionExpired, tokenExpiration],
  );

  return <NologinTokenContext.Provider value={value}>{children}</NologinTokenContext.Provider>;
};

const useNologinToken = () => useContext(NologinTokenContext);

export { NologinTokenProvider, useNologinToken };
