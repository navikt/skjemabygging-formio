import { FyllutFrontendConfig, SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, ReactNode, useContext } from 'react';
import { FrameworkLogger } from '../app-config/AppConfigContext';

interface FyllutHttpHeaders {
  NologinToken?: string;
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

type FyllutEvent = { name: 'last ned'; data: FyllutEventData } | { name: 'last opp'; data: FyllutEventData };

interface FyllutAppConfig {
  baseUrl?: string;
  fyllutBaseURL?: string;
  submissionMethod?: SubmissionMethod;
  config?: Partial<FyllutFrontendConfig>;
  http?: FyllutHttp;
  logger?: FrameworkLogger;
  logEvent?: (event: FyllutEvent) => Promise<void>;
  downloadPdf?: (url: string, body: object) => Promise<Blob | undefined>;
}

interface Props {
  children: ReactNode;
  value: FyllutAppConfig;
}

const FyllutAppConfigContext = createContext<FyllutAppConfig>({});

const FyllutAppConfigProvider = ({ children, value }: Props) => (
  <FyllutAppConfigContext.Provider value={value}>{children}</FyllutAppConfigContext.Provider>
);

const useFyllutAppConfig = () => useContext(FyllutAppConfigContext);

export { FyllutAppConfigProvider, useFyllutAppConfig };
export type { FyllutAppConfig, FyllutEvent, FyllutHttp, FyllutHttpHeaders };
