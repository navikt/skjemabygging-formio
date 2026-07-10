import { useValidation } from '@navikt/skjemadigitalisering-shared-frontend';
import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { INTRO_KEY, SUMMARY_KEY } from './constants';

type StepKind = 'intro' | 'panel' | 'summary';

interface WizardNavigationState {
  focusId?: string;
  validationErrorPages?: string[];
}

const useWizardNavigation = (from: StepKind) => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const { pagesWithErrors, hideSummary } = useValidation();
  const prefix = from === 'intro' ? '' : '../';

  const buildState = useCallback(
    (extra?: WizardNavigationState): WizardNavigationState => ({
      validationErrorPages: Array.from(pagesWithErrors),
      ...extra,
    }),
    [pagesWithErrors],
  );

  const goToIntro = useCallback(() => {
    hideSummary();
    navigate({ pathname: from === 'intro' ? '.' : '..', search }, { state: buildState() });
  }, [buildState, from, hideSummary, navigate, search]);

  const goToPanel = useCallback(
    (panelKey?: string, extra?: WizardNavigationState) => {
      if (!panelKey) {
        return;
      }
      hideSummary();
      navigate({ pathname: `${prefix}${panelKey}`, search }, { state: buildState(extra) });
    },
    [buildState, hideSummary, navigate, prefix, search],
  );

  const goToSummary = useCallback(
    (extra?: WizardNavigationState) => {
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

  const onStepClick = useCallback(
    (key: string) => {
      if (key === INTRO_KEY) {
        goToIntro();
      } else if (key === SUMMARY_KEY) {
        goToSummary();
      } else {
        goToPanel(key);
      }
    },
    [goToIntro, goToPanel, goToSummary],
  );

  return { goToIntro, goToPanel, goToSummary, goToError, onStepClick };
};

export { useWizardNavigation };
export type { WizardNavigationState };
