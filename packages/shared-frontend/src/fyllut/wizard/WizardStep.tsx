import { Form, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { FormHeader, FormStepper, StepperProvider } from '../framework';
import { INTRO_KEY, SUMMARY_KEY } from './constants';
import { consumeStepperOpenState } from './stepperOpenState';

interface Props {
  form: Form;
  activeIndex: number;
  pageTitle: string;
  onStepClick: (key: string) => void;
  children: ReactNode;
}

const PAGE_TITLE_ID = 'page-title';
const EDITABLE_FIELD_SELECTOR = 'input, select, textarea';

/**
 * The page title is focused after step navigation, but the new step may render in several passes,
 * which can replace the heading element and drop the focus. Reapply focus for a few frames, without
 * stealing focus from a field the user is editing or from another element that got focus meanwhile.
 */
const focusPageTitleAfterNavigation = (remainingAttempts = 10, isFirstAttempt = true) => {
  const pageTitle = document.getElementById(PAGE_TITLE_ID);
  const activeElement = document.activeElement;

  if (activeElement?.matches(EDITABLE_FIELD_SELECTOR)) {
    return;
  }

  const canTakeFocus = isFirstAttempt || !activeElement || activeElement === document.body;
  if (canTakeFocus) {
    pageTitle?.focus();
  } else if (activeElement !== pageTitle) {
    return;
  }

  if (remainingAttempts > 1) {
    requestAnimationFrame(() => focusPageTitleAfterNavigation(remainingAttempts - 1, false));
  }
};

const WizardStep = ({ form, activeIndex, pageTitle, onStepClick, children }: Props) => (
  <WizardStepContent form={form} activeIndex={activeIndex} pageTitle={pageTitle} onStepClick={onStepClick}>
    {children}
  </WizardStepContent>
);

const WizardStepContent = ({ form, activeIndex, pageTitle, onStepClick, children }: Props) => {
  const { pathname, hash, state } = useLocation();
  const previousPathname = useRef<string | undefined>(undefined);
  const locationState = typeof state === 'object' && state ? (state as Record<string, unknown>) : undefined;
  const trailingSteps = [{ key: SUMMARY_KEY, label: TEXTS.statiske.summaryPage.title }];
  const [isStepperOpen, setIsStepperOpen] = useState(() => {
    const persistedStepperOpen = consumeStepperOpenState();
    return locationState?.stepperOpen === true || persistedStepperOpen;
  });
  const handleStepClick = (key: string) => {
    if (window.innerWidth < 768) {
      setIsStepperOpen(false);
    }
    onStepClick(key);
  };

  useEffect(() => {
    const isNavigationBetweenSteps = previousPathname.current !== undefined && previousPathname.current !== pathname;
    previousPathname.current = pathname;

    if (!isNavigationBetweenSteps) {
      return;
    }

    const hasFieldFocusTarget = Boolean(hash || locationState?.focusId);
    const isRedirect = locationState?.redirect === true;
    if (hasFieldFocusTarget || isRedirect) {
      return;
    }

    focusPageTitleAfterNavigation();
  }, [hash, pathname, state]);

  return (
    <StepperProvider isOpen={isStepperOpen}>
      <FormHeader form={form} pageTitle={pageTitle} />
      <FormStepper
        activeIndex={activeIndex}
        leadingSteps={[{ key: INTRO_KEY, label: TEXTS.grensesnitt.introPage.title }]}
        trailingSteps={trailingSteps}
        onStepClick={handleStepClick}
        open={isStepperOpen}
        onOpenChange={setIsStepperOpen}
      />
      {children}
    </StepperProvider>
  );
};

export default WizardStep;
