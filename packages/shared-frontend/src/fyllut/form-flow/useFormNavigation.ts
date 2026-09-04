import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useValidation } from '../../context/validation/ValidationContext';
import { withoutSubmissionNavigationState } from '../../utils/navigationState';
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
  const { pagesWithErrors, hideSummary } = useValidation();
  const prefix = from === 'intro' ? '' : '../';

  const buildState = useCallback(
    (extra?: FormNavigationState): FormNavigationState => {
      const { redirect: _inheritedRedirect, ...inheritedState } = withoutSubmissionNavigationState(state);

      return {
        ...inheritedState,
        validationErrorPages: Array.from(pagesWithErrors),
        ...extra,
      };
    },
    [pagesWithErrors, state],
  );

  const goToIntro = useCallback(() => {
    hideSummary();
    navigate({ pathname: from === 'intro' ? '.' : '..', search }, { state: buildState() });
  }, [buildState, from, hideSummary, navigate, search]);

  const goToPanel = useCallback(
    (panelKey?: string, extra?: FormNavigationState) => {
      if (!panelKey) {
        return;
      }
      hideSummary();
      navigate(
        { pathname: `${prefix}${panelKey}`, search },
        { state: buildState(extra), replace: extra?.redirect === true },
      );
    },
    [buildState, hideSummary, navigate, prefix, search],
  );

  const goToSummary = useCallback(
    (extra?: FormNavigationState) => {
      hideSummary();
      navigate({ pathname: `${prefix}${SUMMARY_KEY}`, search }, { state: buildState(extra) });
    },
    [buildState, hideSummary, navigate, prefix, search],
  );

  const goToError = useCallback(
    (pageKey: string, id: string) => {
      hideSummary();
      navigate({ pathname: `${prefix}${pageKey}`, search, hash: `#${id}` }, { state: buildState({ focusId: id }) });
    },
    [buildState, hideSummary, navigate, prefix, search],
  );

  return { goToIntro, goToPanel, goToSummary, goToError };
};

export { useFormNavigation };
export type { FormNavigationState };
