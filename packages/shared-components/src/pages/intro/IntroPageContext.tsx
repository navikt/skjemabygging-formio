import { Form, SubmissionMethod, submissionTypesUtils } from '@navikt/skjemadigitalisering-shared-domain';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export enum IntroPageState {
  DEFAULT = 'default',
  NONE = 'none',
  PAPER = 'paper',
  DIGITAL = 'digital',
  DIGITAL_NO_LOGIN = 'digitalnologin',
  NO_LOGIN = 'no_login',
}

interface IntroPageContextType {
  form: Form;
  state: IntroPageState;
  setState: (state: IntroPageState) => void;
  setSelfDeclaration: (selfDeclaration: boolean) => void;
  selfDeclaration?: boolean;
  setError: (error: string | undefined) => void;
  error?: string | undefined;
  forceRedirectToSub: (sub: SubmissionMethod, path?: string) => void;
  showSelectSubmissionType: () => boolean;
}

interface IntroPageProviderProps {
  form: Form;
  children: React.ReactNode;
}

const IntroPageContext = createContext<IntroPageContextType>({} as IntroPageContextType);

export const IntroPageProvider = ({ children, form }: IntroPageProviderProps) => {
  const [searchParams] = useSearchParams();
  const submissionMethod = (searchParams.get('sub') as SubmissionMethod) ?? undefined;
  const [selfDeclaration, setSelfDeclaration] = useState<boolean>();
  const [error, setError] = useState<string | undefined>();

  const toState = useCallback(
    (sub?: SubmissionMethod) => {
      if (sub) {
        switch (sub) {
          case 'digitalnologin':
            return IntroPageState.DIGITAL_NO_LOGIN;
          case 'digital':
            return IntroPageState.DIGITAL;
          case 'paper':
            return IntroPageState.PAPER;
        }
      }

      if (form.properties?.submissionTypes) {
        if (submissionTypesUtils.isPaperSubmissionOnly(form.properties.submissionTypes)) {
          return IntroPageState.PAPER;
        }
        if (submissionTypesUtils.isDigitalSubmissionOnly(form.properties.submissionTypes)) {
          return IntroPageState.DIGITAL;
        }
        if (submissionTypesUtils.isDigitalNoLoginSubmissionOnly(form.properties.submissionTypes)) {
          return IntroPageState.DIGITAL_NO_LOGIN;
        }
        if (submissionTypesUtils.isNoneSubmission(form.properties.submissionTypes)) {
          return IntroPageState.NONE;
        }
      }

      return IntroPageState.DEFAULT;
    },
    [form.properties?.submissionTypes],
  );

  const [state, setState] = useState<IntroPageState>(toState(submissionMethod));

  useEffect(() => {
    setState(toState(submissionMethod));
  }, [submissionMethod, toState]);

  const forceRedirectToSub = (sub: SubmissionMethod, path?: string) => {
    const { origin, pathname } = window.location;
    let href = `${origin}${pathname}`;
    if (path) {
      href = `${href}/${path}`;
    }
    // Important to force redirect to force idporten redirect if sub=digital
    // and to make sure appCondig have the correct submissionMethod
    window.location.href = `${href}${searchParams.size > 0 ? '&' : '?'}sub=${sub}`;
  };

  const showSelectSubmissionType = () => {
    return form.properties?.submissionTypes && (state === IntroPageState.NO_LOGIN || state === IntroPageState.DEFAULT);
  };

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
        forceRedirectToSub,
        showSelectSubmissionType,
      }}
    >
      {children}
    </IntroPageContext.Provider>
  );
};

export const useIntroPage = () => useContext(IntroPageContext);
