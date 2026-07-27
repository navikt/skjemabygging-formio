import { useAppConfig, useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import { Form, navFormUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import {
  FormButtonRow,
  FormErrorSummary,
  FormNextButton,
  FormPrevButton,
  RenderInputForm,
  useFormPersistence,
  useValidation,
  useWizardController,
} from '@navikt/skjemadigitalisering-shared-frontend';
import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router';
import FormSecondaryButtons from '../FormSecondaryButtons';
import WizardStep from './WizardStep';
import { ATTACHMENTS_KEY } from './constants';
import { useWizardNavigation } from './useWizardNavigation';

const PanelStep = ({ form }: { form: Form }) => {
  const { translate } = useLanguages();
  const { submissionMethod } = useAppConfig();
  const { panelSlug } = useParams<{ panelSlug?: string }>();
  const { hash, state } = useLocation();
  const { saveDraft, canSaveDraft } = useFormPersistence();
  const { syncPageValidationState, validatePages } = useValidation();
  const { currentPanel, components, isFirst, isLast, goToNext, panels, currentIndex } = useWizardController(panelSlug);
  const { goToIntro, goToPanel, goToSummary, goToError, onStepClick } = useWizardNavigation('panel');
  const navigationRole = form.path === 'newrender' ? 'button' : 'link';
  const nextLabel =
    submissionMethod === 'digital' && form.path !== 'newrender'
      ? TEXTS.grensesnitt.navigation.saveAndContinue
      : TEXTS.grensesnitt.navigation.next;

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

  const handleNext = async () => {
    const valid = goToNext();
    if (!valid) {
      return;
    }
    if (canSaveDraft) {
      await saveDraft();
    }
    if (isLast) {
      const validationPages = panels.map((panel) => ({ pageKey: panel.key, components: panel.components ?? [] }));
      const failedPageKeys = validatePages(validationPages);
      if (failedPageKeys.length === 0 && navFormUtils.hasAttachment(form)) {
        goToPanel(ATTACHMENTS_KEY);
        return;
      }
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
      <FormSecondaryButtons />
      <FormButtonRow
        previousButton={
          <FormPrevButton
            label={translate(TEXTS.grensesnitt.navigation.previous)}
            onClick={handlePrevious}
            role={navigationRole}
          />
        }
        nextButton={<FormNextButton label={translate(nextLabel)} onClick={handleNext} role={navigationRole} />}
      />
    </WizardStep>
  );
};

export default PanelStep;
