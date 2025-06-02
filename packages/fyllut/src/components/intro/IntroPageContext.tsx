import { Form, submissionTypesUtils } from '@navikt/skjemadigitalisering-shared-domain';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export enum IntroPageState {
  NONE,
  PAPER,
  DIGITAL,
}

interface IntroPageContextType {
  form: Form;
  state?: IntroPageState;
  setState: (state: IntroPageState) => void;
}

interface IntroPageProviderProps {
  form: Form;
  children: React.ReactNode;
}

const IntroPageContext = createContext<IntroPageContextType>({} as IntroPageContextType);

export const IntroPageProvider = ({ children, form }: IntroPageProviderProps) => {
  const [searchParams] = useSearchParams();
  const submissionMethod = searchParams.get('sub') ?? undefined;

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
      }}
    >
      {children}
    </IntroPageContext.Provider>
  );
};

export const useIntroPage = () => useContext(IntroPageContext);
