import { Provider as AkselProvider } from '@navikt/ds-react';
import { ResponseError, SendinnFormRequest, SendinnFormResult } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { ErrorPage } from '../../app/error/ErrorPage';
import { SessionExpiredMessage } from '../../app/error/SessionExpiredMessage';
import { UnavailablePage } from '../../app/error/UnavailablePage';
import http from '../../app/http/http';
import { getAkselLocale } from '../../app/language/akselLocale';
import SkeletonList from '../../app/loading/SkeletonList';
import { LanguageProvider } from '../../context/language/LanguageContext';
import { LoadSendinnForm } from './createSendinnFormService';

interface Props {
  request: SendinnFormRequest;
  loadForm: LoadSendinnForm;
  onLoadError: (error: unknown) => void;
  loginUrl: string;
  children: ReactNode;
}

type State =
  | { status: 'loading' }
  | { status: 'loaded'; result: SendinnFormResult }
  | { status: 'unavailable' }
  | { status: 'sessionExpired' }
  | { status: 'error'; correlationId?: string };

const SendinnFormContext = createContext<SendinnFormResult | undefined>(undefined);

// The entry keys this provider by request, so a changed path, language or filter cannot expose stale content.
const SendinnFormProvider = ({ request, loadForm, onLoadError, loginUrl, children }: Props) => {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    loadForm(request)
      .then((result) => {
        if (!cancelled) setState({ status: 'loaded', result });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (http.isAuthenticationError(error)) {
          setState({ status: 'sessionExpired' });
        } else if (error instanceof ResponseError && error.errorCode === 'NOT_FOUND') {
          setState({ status: 'unavailable' });
        } else {
          onLoadError(error);
          setState({
            status: 'error',
            correlationId: error instanceof ResponseError ? error.correlationId : undefined,
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [loadForm, request, onLoadError]);

  if (state.status === 'loading') return <SkeletonList size={3} />;
  if (state.status === 'unavailable') return <UnavailablePage />;
  if (state.status === 'sessionExpired') return <SessionExpiredMessage loginUrl={loginUrl} />;
  if (state.status === 'error') return <ErrorPage correlationId={state.correlationId} />;

  const { result } = state;
  return (
    <SendinnFormContext.Provider value={result}>
      <LanguageProvider
        translations={result.translations}
        currentLanguage={result.language}
        availableLanguages={result.languages}
      >
        <AkselProvider locale={getAkselLocale(result.language)}>{children}</AkselProvider>
      </LanguageProvider>
    </SendinnFormContext.Provider>
  );
};

const useSendinnForm = (): SendinnFormResult => {
  const result = useContext(SendinnFormContext);
  if (!result) throw new Error('Sendinn form context is required');
  return result;
};

export { SendinnFormProvider, useSendinnForm };
