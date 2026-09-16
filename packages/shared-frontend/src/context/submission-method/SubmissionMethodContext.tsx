import { SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, ReactNode, useContext, useMemo } from 'react';

interface SubmissionMethodContextValue {
  submissionMethod?: SubmissionMethod;
}

interface Props extends SubmissionMethodContextValue {
  children: ReactNode;
}

const SubmissionMethodContext = createContext<SubmissionMethodContextValue>({});

const SubmissionMethodProvider = ({ children, submissionMethod }: Props) => {
  const value = useMemo(() => ({ submissionMethod }), [submissionMethod]);
  return <SubmissionMethodContext.Provider value={value}>{children}</SubmissionMethodContext.Provider>;
};

const useSubmissionMethod = () => useContext(SubmissionMethodContext);

export { SubmissionMethodProvider, useSubmissionMethod };
export type { SubmissionMethodContextValue };
