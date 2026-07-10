import { useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import { Form, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import {
  FormButtonRow,
  FormErrorSummary,
  FormNextButton,
  FormPrevButton,
  RenderInputForm,
  useValidation,
  useWizardController,
} from '@navikt/skjemadigitalisering-shared-frontend';
import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router';
import WizardStep from './WizardStep';
import { useWizardNavigation } from './useWizardNavigation';

const PanelStep = ({ form }: { form: Form }) => {
  const { translate } = useLanguages();
  const { panelSlug } = useParams<{ panelSlug?: string }>();
  const { hash, state } = useLocation();
  const { getErrorsForPages, syncPageValidationState, validatePages } = useValidation();
  const { currentPanel, components, isFirst, isLast, goToNext, panels, currentIndex } = useWizardController(panelSlug);
  const { goToIntro, goToPanel, goToSummary, goToError, onStepClick } = useWizardNavigation('panel');

  useEffect(() => {
    if (panels.length > 0 && panelSlug && !panels.some((panel) => panel.key === panelSlug)) {
      goToPanel(panels[0].key);
    }
  }, [goToPanel, panelSlug, panels]);

  useEffect(() => {
    if (currentPanel) {
      syncPageValidationState(currentPanel.key, components);
    }
  }, [components, currentPanel, syncPageValidationState]);

  useEffect(() => {
    const locationStateFocusId = typeof state === 'object' && state && 'focusId' in state ? state.focusId : undefined;
    const targetId = (locationStateFocusId as string | undefined) ?? hash.slice(1);
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
      }
    };

    focusHashTarget();
  }, [components, hash, state]);

  const handleNext = () => {
    const valid = goToNext();
    if (!valid) {
      return;
    }
    if (isLast) {
      const validationPages = panels.map((panel) => ({ pageKey: panel.key, components: panel.components ?? [] }));
      const failedPageKeys = Array.from(new Set(getErrorsForPages(validationPages).map((error) => error.pageKey)));
      validatePages(validationPages);
      goToSummary({ validationErrorPages: failedPageKeys });
      return;
    }
    goToPanel(panels[currentIndex + 1]?.key);
  };

  const handlePrevious = () => {
    if (isFirst) {
      goToIntro();
      return;
    }
    goToPanel(panels[currentIndex - 1]?.key);
  };

  return (
    <WizardStep
      form={form}
      activeIndex={1 + currentIndex}
      pageTitle={translate(currentPanel?.title ?? '')}
      onStepClick={onStepClick}
    >
      <RenderInputForm pageKey={currentPanel?.key ?? ''} pageComponents={components} components={components} />
      <FormErrorSummary
        pageKey={currentPanel?.key}
        components={components}
        onNavigateToField={(error, id) => {
          if (error.pageKey !== currentPanel?.key) {
            goToError(error.pageKey, id);
          }
        }}
      />
      <FormButtonRow
        previousButton={
          <FormPrevButton label={translate(TEXTS.grensesnitt.navigation.previous)} onClick={handlePrevious} />
        }
        nextButton={<FormNextButton label={translate(TEXTS.grensesnitt.navigation.next)} onClick={handleNext} />}
      />
    </WizardStep>
  );
};

export default PanelStep;
