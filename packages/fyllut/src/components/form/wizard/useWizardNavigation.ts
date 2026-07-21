import { Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { useSubmissionState, useValidation } from '@navikt/skjemadigitalisering-shared-frontend';
import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { INTRO_KEY, SUMMARY_KEY } from './constants';

interface WizardNavigationState {
  focusId?: string;
  validationErrorPages?: string[];
  initialSubmission?: Submission;
  preserveInitialSubmission?: true;
}

type StepKind = 'intro' | 'panel' | 'attachment' | 'summary';

const useWizardNavigation = (from: StepKind) => {
  const navigate = useNavigate();
  const { search, state } = useLocation();
  const { pagesWithErrors, hideSummary } = useValidation();
  const { submission } = useSubmissionState();
  const prefix = from === 'intro' ? '' : '../';

  const buildState = useCallback(
    (extra?: WizardNavigationState): WizardNavigationState => ({
      ...(typeof state === 'object' && state ? state : {}),
      initialSubmission: submission,
      preserveInitialSubmission: true,
      validationErrorPages: Array.from(pagesWithErrors),
      ...extra,
    }),
    [pagesWithErrors, state, submission],
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
