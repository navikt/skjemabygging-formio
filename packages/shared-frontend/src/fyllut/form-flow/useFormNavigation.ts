import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useValidationActions, useValidationPagesWithErrors } from '../../context/validation/ValidationContext';
import { SUMMARY_KEY } from './constants';

interface FormNavigationState {
  focusId?: string;
  validationErrorPages?: string[];
  redirect?: true;
}

type StepKind = 'intro' | 'panel' | 'summary';

const useFormNavigation = (from: StepKind) => {
  const navigate = useNavigate();
  const { search, state } = useLocation();
  const { hideErrorSummary } = useValidationActions();
  const pagesWithErrors = useValidationPagesWithErrors();
  const prefix = from === 'intro' ? '' : '../';

  const buildState = useCallback(
    (extra?: FormNavigationState): FormNavigationState => {
      const { redirect: _inheritedRedirect, ...inheritedState } = state ?? {};

      return {
        ...inheritedState,
        validationErrorPages: Array.from(pagesWithErrors),
        ...extra,
      };
    },
    [pagesWithErrors, state],
  );

  const goToIntro = useCallback(() => {
    hideErrorSummary();
    navigate({ pathname: from === 'intro' ? '.' : '..', search }, { state: buildState() });
  }, [buildState, from, hideErrorSummary, navigate, search]);

  const goToPanel = useCallback(
    (panelKey?: string, extra?: FormNavigationState) => {
      if (!panelKey) {
        return;
      }
      hideErrorSummary();
      navigate(
        { pathname: `${prefix}${panelKey}`, search },
        { state: buildState(extra), replace: extra?.redirect === true },
      );
    },
    [buildState, hideErrorSummary, navigate, prefix, search],
  );

  const goToSummary = useCallback(
    (extra?: FormNavigationState) => {
      hideErrorSummary();
      navigate({ pathname: `${prefix}${SUMMARY_KEY}`, search }, { state: buildState(extra) });
    },
    [buildState, hideErrorSummary, navigate, prefix, search],
  );

  const goToError = useCallback(
    (pageKey: string, id: string) => {
      hideErrorSummary();
      navigate({ pathname: `${prefix}${pageKey}`, search, hash: `#${id}` }, { state: buildState({ focusId: id }) });
    },
    [buildState, hideErrorSummary, navigate, prefix, search],
  );

  return { goToIntro, goToPanel, goToSummary, goToError };
};

export { useFormNavigation };
export type { FormNavigationState };
