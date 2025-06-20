import { useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
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
  forceRedirectToSub: (sub: SubmissionMethod) => void;
  showSelectSubmissionType: () => boolean;
}

interface IntroPageProviderProps {
  form: Form;
  children: React.ReactNode;
}

const IntroPageContext = createContext<IntroPageContextType>({} as IntroPageContextType);

export const IntroPageProvider = ({ children, form }: IntroPageProviderProps) => {
  const [searchParams] = useSearchParams();
  const { baseUrl } = useAppConfig();
  const submissionMethod = (searchParams.get('sub') as SubmissionMethod) ?? undefined;

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

  const forceRedirectToSub = (sub: SubmissionMethod) => {
    // Important to force redirect to force idporten redirect if sub=digital
    // and to make sure appCondig have the correct submissionMethod
    window.location.href = `${baseUrl}${location.pathname}${location.search ? `${location.search}&sub=${sub}` : `?sub=${sub}`}`;
  };

  const showSelectSubmissionType = () => {
    return state === IntroPageState.NO_LOGIN || state === IntroPageState.DEFAULT;
  };

  return (
    <IntroPageContext.Provider
      value={{
        form,
        state,
        setState,
        forceRedirectToSub,
        showSelectSubmissionType,
      }}
    >
      {children}
    </IntroPageContext.Provider>
  );
};

export const useIntroPage = () => useContext(IntroPageContext);
