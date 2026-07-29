import { TEXTS, navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect } from 'react';
import FormErrorSummary from '../../components/error-summary/FormErrorSummary';
import { useAppConfig } from '../../context/app-config/AppConfigContext';
import { useFormDefinition } from '../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../context/language/LanguageContext';
import { useFormPersistence } from '../../context/persistence/PersistenceContext';
import { useValidation } from '../../context/validation/ValidationContext';
import RenderInputForm from '../../form-components/RenderInputForm';
import { FormButtonRow, FormNextButton, FormPrevButton } from '../../layout/FormButtonRow';
import { useWizardController } from '../../wizard/useWizardController';
import type { SharedFormRendererProps } from '../types';
import SecondaryActions from '../wizard/SecondaryActions';
import useRendererNavigation from '../wizard/useRendererNavigation';

const PanelPage = ({
  host,
  panelKey,
  focusId,
}: {
  host: SharedFormRendererProps['host'];
  panelKey: string;
  focusId?: string;
}) => {
  const { form, panels } = useFormDefinition();
  const { translate } = useLanguage();
  const { submissionMethod } = useAppConfig();
  const { saveDraft, canSaveDraft } = useFormPersistence();
  const { syncPageValidationState, validatePages } = useValidation();
  const { currentPanel, components, isFirst, isLast, goToNext, currentIndex } = useWizardController(panelKey);
  const navigate = useRendererNavigation(host);

  useEffect(() => {
    if (panels.length && !panels.some((panel) => panel.key === panelKey)) {
      navigate({ kind: 'panel', panelKey: panels[0].key });
    }
  }, [navigate, panelKey, panels]);

  useEffect(() => {
    if (currentPanel) {
      syncPageValidationState(currentPanel.key, components);
    }
  }, [components, currentPanel, syncPageValidationState]);

  useEffect(() => {
    if (!focusId) {
      return;
    }

    const focusTarget = (remainingAttempts = 20) => {
      const element = document.getElementById(focusId);
      if (!element) {
        if (remainingAttempts > 1) {
          requestAnimationFrame(() => focusTarget(remainingAttempts - 1));
        }
        return;
      }

      element.scrollIntoView({ block: 'center' });
      const target =
        element.matches('input, select, textarea, button, [tabindex]') || element.tabIndex >= 0
          ? element
          : element.querySelector<HTMLElement>('input, select, textarea, button, [tabindex]');
      target?.focus({ preventScroll: true });
      if (target && document.activeElement !== target && remainingAttempts > 1) {
        requestAnimationFrame(() => focusTarget(remainingAttempts - 1));
      }
    };

    focusTarget();
  }, [components, focusId]);

  const next = async () => {
    if (!goToNext()) {
      return;
    }
    if (canSaveDraft) {
      await saveDraft();
    }
    if (isLast) {
      const pages = panels.map((panel) => ({ pageKey: panel.key, components: panel.components ?? [] }));
      const failedPages = validatePages(pages);
      navigate(
        failedPages.length === 0 && navFormUtils.hasAttachment(form) ? { kind: 'attachments' } : { kind: 'summary' },
        { validationErrorPages: failedPages },
      );
      return;
    }
    const nextPanel = panels[currentIndex + 1];
    if (nextPanel) {
      navigate({ kind: 'panel', panelKey: nextPanel.key });
    }
  };

  return (
    <>
      <RenderInputForm pageKey={currentPanel?.key ?? ''} pageComponents={components} components={components} />
      <FormErrorSummary
        pageKey={currentPanel?.key}
        components={components}
        onNavigateToField={(error, id) => {
          if (error.pageKey !== currentPanel?.key) {
            navigate({ kind: 'panel', panelKey: error.pageKey, focusId: id }, { focusId: id });
          }
        }}
      />
      <SecondaryActions host={host} />
      <FormButtonRow
        previousButton={
          <FormPrevButton
            label={translate(TEXTS.grensesnitt.navigation.previous)}
            onClick={() =>
              isFirst
                ? navigate({ kind: 'intro' })
                : navigate({ kind: 'panel', panelKey: panels[currentIndex - 1]?.key ?? '' })
            }
          />
        }
        nextButton={
          <FormNextButton
            label={translate(
              submissionMethod === 'digital'
                ? TEXTS.grensesnitt.navigation.saveAndContinue
                : TEXTS.grensesnitt.navigation.next,
            )}
            onClick={() => void next()}
          />
        }
      />
    </>
  );
};

export default PanelPage;
