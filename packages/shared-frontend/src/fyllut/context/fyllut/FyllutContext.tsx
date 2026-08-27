import { SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, ReactNode, useContext } from 'react';
import { ApplicationLogger } from '../../../context/application/ApplicationContext';

interface FyllutHttpHeaders {
  NologinToken?: string;
  'x-innsendingsid'?: string;
}

interface FyllutHttp {
  get: <T>(url: string, headers?: FyllutHttpHeaders) => Promise<T>;
  post: <T>(url: string, body: object, headers?: FyllutHttpHeaders) => Promise<T>;
  put: <T>(url: string, body: object, headers?: FyllutHttpHeaders) => Promise<T>;
  delete: <T>(url: string, body?: object, headers?: FyllutHttpHeaders) => Promise<T>;
  postFile: <T>(url: string, body: FormData, headers?: FyllutHttpHeaders) => Promise<T>;
  MimeType: {
    PDF: string;
  };
  isAuthenticationError: (error: unknown) => boolean;
}

interface FyllutEventData {
  type: string;
  tema: string;
  tittel: string;
  skjemaId: string;
  language?: string;
  submissionMethod?: string;
  [key: string]: string | number | boolean | undefined;
}

type FyllutEvent =
  | { name: 'last ned'; data: FyllutEventData }
  | { name: 'last opp'; data: FyllutEventData }
  | {
      name: 'skjema fullført';
      data: {
        skjemaId: string;
        skjemanavn: string;
        tema: string;
        language?: string;
        submissionMethod?: string;
      };
    }
  | {
      name: 'sesjon utløpt';
      data: {
        skjemaId: string;
        skjemanavn: string;
        tema: string;
        submissionMethod?: string;
      };
    };

interface FyllutContextValue {
  baseUrl?: string;
  fyllutBaseUrl?: string;
  isLoggedIn?: boolean;
  http?: FyllutHttp;
  logEvent?: (event: FyllutEvent) => Promise<void>;
  downloadPdf?: (url: string, body: object) => Promise<Blob | undefined>;
}

interface FyllutApiConfig extends FyllutContextValue {
  logger?: ApplicationLogger;
  submissionMethod?: SubmissionMethod;
}

interface Props {
  children: ReactNode;
  value: FyllutContextValue;
}

const FyllutContext = createContext<FyllutContextValue>({});

const FyllutProvider = ({ children, value }: Props) => (
  <FyllutContext.Provider value={value}>{children}</FyllutContext.Provider>
);

const useFyllut = () => useContext(FyllutContext);

export { FyllutProvider, useFyllut };
export type { FyllutApiConfig, FyllutContextValue, FyllutEvent, FyllutHttp, FyllutHttpHeaders };
