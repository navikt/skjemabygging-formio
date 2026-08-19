import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useRef } from 'react';
import { useLocation, useParams } from 'react-router';
import { useLanguage } from '../../context/language/LanguageContext';
import { useSubmissionMethod } from '../../context/submission-method/SubmissionMethodContext';
import {
  CancelAndDeleteButton,
  FormButtonRow,
  FormErrorSummary,
  FormNextButton,
  FormPrevButton,
  RenderInputForm,
  SaveButton,
  useFormActions,
  useValidation,
  useWizardController,
} from '../framework';
import { useWizardNavigation } from './useWizardNavigation';

const PanelStep = () => {
  const { translate } = useLanguage();
  const { submissionMethod } = useSubmissionMethod();
  const { panelSlug } = useParams<{ panelSlug?: string }>();
  const { hash, state } = useLocation();
  const { saveDraft, canSaveDraft } = useFormActions();
  const { syncPageValidationState, validatePages } = useValidation();
  const { currentPanel, components, isFirst, isLast, goToNext, panels, currentIndex } = useWizardController(panelSlug);
  const { goToIntro, goToPanel, goToSummary, goToError } = useWizardNavigation('panel');
  const previousPanelKeys = useRef<string[]>(panels.map((panel) => panel.key));
  const nextLabel =
    submissionMethod === 'digital' ? TEXTS.grensesnitt.navigation.saveAndContinue : TEXTS.grensesnitt.navigation.next;

  useEffect(() => {
    if (panels.length > 0 && panelSlug && !panels.some((panel) => panel.key === panelSlug)) {
      const previousIndex = previousPanelKeys.current.indexOf(panelSlug);
      const fallbackIndex = previousIndex >= 0 ? Math.min(previousIndex, panels.length - 1) : 0;
      goToPanel(panels[fallbackIndex]?.key, { redirect: true });
    } else if (panels.length === 0 && panelSlug) {
      goToSummary({ redirect: true });
    }
  }, [goToPanel, goToSummary, panelSlug, panels]);

  useEffect(() => {
    previousPanelKeys.current = panels.map((panel) => panel.key);
  }, [panels]);

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
    if (canSaveDraft && !(await saveDraft())) {
      return;
    }
    if (isLast) {
      const validationPages = panels.map((panel) => ({ pageKey: panel.key, components: panel.components ?? [] }));
      goToSummary({ validationErrorPages: validatePages(validationPages) });
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
    <>
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
        cancelButton={<CancelAndDeleteButton />}
        previousButton={
          <FormPrevButton label={translate(TEXTS.grensesnitt.navigation.previous)} onClick={handlePrevious} />
        }
        nextButton={<FormNextButton label={translate(nextLabel)} onClick={handleNext} />}
        saveButton={canSaveDraft && <SaveButton />}
      />
    </>
  );
};

export default PanelStep;
