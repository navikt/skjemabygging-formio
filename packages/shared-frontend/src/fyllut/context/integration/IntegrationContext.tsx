import { createContext, ReactNode, useContext } from 'react';

interface IntegrationHttpHeaders {
  NologinToken?: string;
  'x-innsendingsid'?: string;
  Accept?: string;
}

interface IntegrationHttp {
  get: <T>(url: string, headers?: IntegrationHttpHeaders) => Promise<T>;
  post: <T>(url: string, body: object, headers?: IntegrationHttpHeaders) => Promise<T>;
  put: <T>(url: string, body: object, headers?: IntegrationHttpHeaders) => Promise<T>;
  delete: <T>(url: string, body?: object, headers?: IntegrationHttpHeaders) => Promise<T>;
  postFile: <T>(url: string, body: FormData, headers?: IntegrationHttpHeaders) => Promise<T>;
  MimeType: {
    PDF: string;
  };
  isAuthenticationError: (error: unknown) => boolean;
}

interface IntegrationEventData {
  type: string;
  tema: string;
  tittel: string;
  skjemaId: string;
  language?: string;
  submissionMethod?: string;
  [key: string]: string | number | boolean | undefined;
}

type IntegrationEvent =
  | { name: 'last ned'; data: IntegrationEventData }
  | { name: 'last opp'; data: IntegrationEventData }
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

interface IntegrationContextValue {
  fyllutBaseUrl: string;
  isLoggedIn?: boolean;
  logEvent?: (event: IntegrationEvent) => Promise<void>;
}

interface Props {
  children: ReactNode;
  value: IntegrationContextValue;
}

const IntegrationContext = createContext<IntegrationContextValue | undefined>(undefined);

const IntegrationProvider = ({ children, value }: Props) => (
  <IntegrationContext.Provider value={value}>{children}</IntegrationContext.Provider>
);

const useIntegration = () => {
  const context = useContext(IntegrationContext);
  if (!context) {
    throw new Error('Integration context is required to render the form flow.');
  }
  return context;
};

export { IntegrationProvider, useIntegration };
export type { IntegrationContextValue, IntegrationEvent, IntegrationHttp, IntegrationHttpHeaders };
