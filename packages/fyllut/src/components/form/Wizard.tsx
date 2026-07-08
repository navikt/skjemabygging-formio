import { useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import { Form, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import {
  FormButtonRow,
  FormErrorSummary,
  FormHeader,
  FormNextButton,
  FormPrevButton,
  FormStepper,
  RenderInputForm,
  useValidation,
  useWizardController,
} from '@navikt/skjemadigitalisering-shared-frontend';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import IntroPage from './IntroPage';
import Summary from './Summary';

const INTRO_KEY = 'introduksjon';
const SUMMARY_KEY = 'oppsummering';

interface WizardNavigationState {
  focusId?: string;
  validationErrorPages?: string[];
}

interface Props {
  form: Form;
}

const Wizard = ({ form }: Props) => {
  const { translate } = useLanguages();
  const navigate = useNavigate();
  const { pathname, search, hash, state } = useLocation();
  const routeStep = useMemo(() => {
    const pathSegments = pathname.split('/').filter(Boolean);
    if (pathSegments[0] === form.path) {
      return pathSegments[1];
    }
    return pathSegments[0];
  }, [form.path, pathname]);
  const [routeStepOverride, setRouteStepOverride] = useState<string | null | undefined>(undefined);
  const [pendingFocusId, setPendingFocusId] = useState<string>();
  const shouldClearSummaryOnEntry = useRef(false);
  const effectiveRouteStep = routeStepOverride === undefined ? routeStep : (routeStepOverride ?? undefined);
  const showIntro = !effectiveRouteStep;
  const showSummary = effectiveRouteStep === SUMMARY_KEY;
  const requestedPanelKey = !showIntro && !showSummary ? effectiveRouteStep : undefined;
  const { getErrorsForPages, hideSummary, pagesWithErrors, syncPageValidationState, validatePages } = useValidation();
  const { currentPanel, components, isFirst, isLast, goToNext, goToPrevious, goTo, panels, currentIndex } =
    useWizardController(requestedPanelKey);

  const leadingSteps = [{ key: INTRO_KEY, label: TEXTS.grensesnitt.introPage.title }];
  // activeIndex is 0-based across: [intro, ...panels, summary]
  const activeIndex = showIntro ? 0 : showSummary ? 1 + panels.length : 1 + currentIndex;

  const navigateToStep = useCallback(
    (stepKey?: string, options?: { clearSummary?: boolean; state?: WizardNavigationState }) => {
      if (options?.clearSummary) {
        shouldClearSummaryOnEntry.current = true;
        hideSummary();
      }
      setRouteStepOverride(stepKey ?? null);
      navigate(
        { pathname: stepKey ? `/${form.path}/${stepKey}` : `/${form.path}`, search },
        {
          state: {
            validationErrorPages: Array.from(pagesWithErrors),
            ...options?.state,
          } satisfies WizardNavigationState,
        },
      );
    },
    [form.path, hideSummary, navigate, pagesWithErrors, search],
  );

  useEffect(() => {
    if (routeStepOverride === undefined) {
      return;
    }
    if ((routeStepOverride === null && !routeStep) || routeStepOverride === routeStep) {
      queueMicrotask(() => setRouteStepOverride(undefined));
    }
  }, [routeStep, routeStepOverride]);

  useEffect(() => {
    if (!requestedPanelKey || panels.length === 0) {
      return;
    }
    if (!panels.some((panel) => panel.key === requestedPanelKey)) {
      queueMicrotask(() => navigateToStep(panels[0].key));
    }
  }, [navigateToStep, panels, requestedPanelKey]);

  useEffect(() => {
    if (currentPanel) {
      syncPageValidationState(currentPanel.key, components);
    }
  }, [components, currentPanel, syncPageValidationState]);

  useEffect(() => {
    if (!shouldClearSummaryOnEntry.current) {
      return;
    }
    queueMicrotask(() => {
      hideSummary();
      shouldClearSummaryOnEntry.current = false;
    });
  }, [effectiveRouteStep, hideSummary]);

  useEffect(() => {
    const locationStateFocusId = typeof state === 'object' && state && 'focusId' in state ? state.focusId : undefined;
    const targetId = pendingFocusId ?? locationStateFocusId ?? hash.slice(1);
    if (!targetId) {
      return;
    }
    const focusHashTarget = (remainingAttempts = 20) => {
      const element = document.getElementById(targetId);
      if (!element) {
        if (remainingAttempts > 1) {
          requestAnimationFrame(() => focusHashTarget(remainingAttempts - 1));
        }
        return;
      }
      element.scrollIntoView({ block: 'center' });
      const focusTarget =
        element.matches('input, select, textarea, button, [tabindex]') || element.tabIndex >= 0
          ? element
          : element.querySelector<HTMLElement>('input, select, textarea, button, [tabindex]');
      focusTarget?.focus({ preventScroll: true });
      if (focusTarget && document.activeElement !== focusTarget && remainingAttempts > 1) {
        requestAnimationFrame(() => focusHashTarget(remainingAttempts - 1));
        return;
      }
      setPendingFocusId(undefined);
    };

    focusHashTarget();
  }, [components, hash, pendingFocusId, state]);

  const navigateToError = useCallback(
    (pageKey: string, id: string) => {
      shouldClearSummaryOnEntry.current = true;
      hideSummary();
      setRouteStepOverride(pageKey);
      setPendingFocusId(id);
      navigate(
        { pathname: `/${form.path}/${pageKey}`, search, hash: `#${id}` },
        { state: { focusId: id, validationErrorPages: Array.from(pagesWithErrors) } satisfies WizardNavigationState },
      );
    },
    [form.path, hideSummary, navigate, pagesWithErrors, search],
  );

  const handleStepClick = (key: string, _index: number) => {
    if (key === INTRO_KEY) {
      navigateToStep(undefined, { clearSummary: true });
    } else if (key === SUMMARY_KEY) {
      navigateToStep(SUMMARY_KEY, { clearSummary: true });
    } else {
      goTo(key);
      navigateToStep(key, { clearSummary: true });
    }
  };

  const handleNext = () => {
    const valid = goToNext();
    if (!valid) {
      return;
    }
    if (isLast) {
      const validationPages = panels.map((panel) => ({ pageKey: panel.key, components: panel.components ?? [] }));
      const failedPageKeys = Array.from(new Set(getErrorsForPages(validationPages).map((error) => error.pageKey)));
      validatePages(validationPages);
      navigateToStep(SUMMARY_KEY, { clearSummary: true, state: { validationErrorPages: failedPageKeys } });
      return;
    }
    navigateToStep(panels[currentIndex + 1]?.key);
  };

  const stepper = (pageTitle: string) => (
    <>
      <FormHeader form={form} pageTitle={pageTitle} />
      <FormStepper
        activeIndex={activeIndex}
        leadingSteps={leadingSteps}
        trailingSteps={[{ key: SUMMARY_KEY, label: TEXTS.statiske.summaryPage.title }]}
        onStepClick={handleStepClick}
      />
    </>
  );

  if (showIntro) {
    return (
      <>
        {stepper(translate(TEXTS.grensesnitt.introPage.title))}
        <IntroPage onStart={() => navigateToStep(panels[0]?.key)} />
      </>
    );
  }

  if (showSummary) {
    return (
      <>
        {stepper(translate(TEXTS.statiske.summaryPage.title))}
        <Summary
          onBack={() => navigateToStep(panels[panels.length - 1]?.key, { clearSummary: true })}
          onNavigateToError={navigateToError}
        />
      </>
    );
  }

  return (
    <>
      {stepper(translate(currentPanel?.title ?? ''))}
      <RenderInputForm pageKey={currentPanel?.key ?? ''} pageComponents={components} components={components} />
      <FormErrorSummary
        pageKey={currentPanel?.key}
        components={components}
        onNavigateToField={(error, id) => {
          if (error.pageKey !== currentPanel?.key) {
            navigateToError(error.pageKey, id);
          }
        }}
      />
      <FormButtonRow
        previousButton={
          isFirst ? (
            <FormPrevButton label={translate(TEXTS.grensesnitt.navigation.previous)} onClick={() => navigateToStep()} />
          ) : (
            <FormPrevButton
              label={translate(TEXTS.grensesnitt.navigation.previous)}
              onClick={() => {
                goToPrevious();
                navigateToStep(panels[currentIndex - 1]?.key);
              }}
            />
          )
        }
        nextButton={<FormNextButton label={translate(TEXTS.grensesnitt.navigation.next)} onClick={handleNext} />}
      />
    </>
  );
};

export default Wizard;
