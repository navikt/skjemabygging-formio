import { Form, submissionTypesUtils } from '@navikt/skjemadigitalisering-shared-domain';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export enum IntroPageState {
  NONE = 'none',
  PAPER = 'paper',
  DIGITAL = 'digital',
  DIGITAL_NO_LOGIN = 'digitalnologin',
}

interface IntroPageContextType {
  form: Form;
  state?: IntroPageState;
  setState: (state: IntroPageState) => void;
  setSelfDeclaration: (selfDeclaration: boolean) => void;
  selfDeclaration?: boolean;
  setError: (error: string | undefined) => void;
  error?: string | undefined;
}

interface IntroPageProviderProps {
  form: Form;
  children: React.ReactNode;
}

const IntroPageContext = createContext<IntroPageContextType>({} as IntroPageContextType);

export const IntroPageProvider = ({ children, form }: IntroPageProviderProps) => {
  const [searchParams] = useSearchParams();
  const submissionMethod = searchParams.get('sub') ?? undefined;
  const [selfDeclaration, setSelfDeclaration] = useState<boolean>();
  const [error, setError] = useState<string | undefined>();

  const toState = useCallback(
    (sub?: string) => {
      if (sub) {
        return sub === 'paper' ? IntroPageState.PAPER : sub === 'digital' ? IntroPageState.DIGITAL : undefined;
      }

      if (form.properties?.submissionTypes) {
        if (submissionTypesUtils.isPaperSubmissionOnly(form.properties.submissionTypes)) {
          return IntroPageState.PAPER;
        }
        if (submissionTypesUtils.isDigitalSubmissionOnly(form.properties.submissionTypes)) {
          return IntroPageState.DIGITAL;
        }
        if (submissionTypesUtils.isNoneSubmission(form.properties.submissionTypes)) {
          return IntroPageState.NONE;
        }
      }
    },
    [form.properties?.submissionTypes],
  );

  const [state, setState] = useState<IntroPageState | undefined>(toState(submissionMethod));

  useEffect(() => {
    setState(toState(submissionMethod));
  }, [submissionMethod, toState]);

  return (
    <IntroPageContext.Provider
      value={{
        form,
        state,
        setState,
        selfDeclaration,
        setSelfDeclaration,
        setError,
        error,
      }}
    >
      {children}
    </IntroPageContext.Provider>
  );
};

export const useIntroPage = () => useContext(IntroPageContext);
