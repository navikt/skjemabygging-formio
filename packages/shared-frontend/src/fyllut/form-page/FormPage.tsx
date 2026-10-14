import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { useParams } from 'react-router';
import FormErrorSummary from '../../components/error-summary/FormErrorSummary';
import { useFormDefinitionSubmissionMethod } from '../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../context/language/LanguageContext';
import { useValidationActions } from '../../context/validation/ValidationContext';
import RenderInputForm from '../../form-components/RenderInputForm';
import { useFormActions } from '../context/form-actions/FormActionsContext';
import { useFormNavigation } from '../form-flow/useFormNavigation';
import FormActionError from '../layout/FormActionError';
import { FormButtonRow, FormNextButton, FormPrevButton } from '../layout/FormButtonRow';
import CancelAndDeleteButton from '../navigation/CancelAndDeleteButton';
import SaveButton from '../navigation/SaveButton';
import { useFieldFocus } from './useFieldFocus';
import { useFormPageController } from './useFormPageController';

const FormPage = () => {
  const { translate } = useLanguage();
  const submissionMethod = useFormDefinitionSubmissionMethod();
  const { panelSlug } = useParams<{ panelSlug?: string }>();
  const { saveDraft, canSaveDraft } = useFormActions();
  const { schedulePageValidation, validatePages } = useValidationActions();
  const { currentPanel, components, isFirst, isLast, goToNext, panels, currentIndex } =
    useFormPageController(panelSlug);
  const { goToIntro, goToPanel, goToSummary, goToError } = useFormNavigation('panel');
  const previousPanelKeys = useRef<string[]>(panels.map((panel) => panel.key));
  const continueFromPageRef = useRef<(pageKey: string) => void>();
  const nextLabel =
    submissionMethod === 'digital' ? TEXTS.grensesnitt.navigation.saveAndContinue : TEXTS.grensesnitt.navigation.next;

  useFieldFocus();

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
      schedulePageValidation(currentPanel.key);
    }
  }, [components, currentPanel, schedulePageValidation]);

  // A save may outlive page or condition changes; resume against the current page only.
  useLayoutEffect(() => {
    continueFromPageRef.current = (pageKey) => {
      if (currentPanel?.key !== pageKey || !goToNext()) {
        return;
      }
      if (isLast) {
        goToSummary({ validationErrorPages: validatePages(panels.map((panel) => panel.key)) });
        return;
      }
      goToPanel(panels[currentIndex + 1]?.key);
    };

    return () => {
      continueFromPageRef.current = undefined;
    };
  }, [currentPanel, goToNext, isLast, goToSummary, validatePages, panels, goToPanel, currentIndex]);

  const handleNext = async () => {
    if (!currentPanel) {
      return;
    }
    if (canSaveDraft && (!goToNext() || !(await saveDraft()))) {
      return;
    }
    continueFromPageRef.current?.(currentPanel.key);
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
      <RenderInputForm pageKey={currentPanel?.key ?? ''} components={components} />
      <FormErrorSummary
        pageKey={currentPanel?.key}
        onNavigateToField={(error, id) => {
          if (error.pageKey !== currentPanel?.key) {
            goToError(error.pageKey, id);
          }
        }}
      />
      <FormActionError />
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

export default FormPage;
