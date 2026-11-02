import { flattenComponents, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import Alert from '../../components/alert/Alert';
import FormErrorSummary from '../../components/error-summary/FormErrorSummary';
import { useApplication } from '../../context/application/ApplicationContext';
import { useFormDefinitionForm, useFormDefinitionPanels } from '../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../context/language/LanguageContext';
import { useSubmissionState } from '../../context/state/SubmissionStateContext';
import { useValidationActions } from '../../context/validation/ValidationContext';
import RenderInputForm from '../../form-components/RenderInputForm';
import RenderSummaryForm from '../../form-components/RenderSummaryForm';
import { SUMMARY_KEY } from '../../form-flow/constants';
import FormFlowLayout from '../../form-flow/FormFlowLayout';
import { FormButtonRow, FormNextButton, FormPrevButton } from '../../form-flow/layout/FormButtonRow';
import { useFieldFocus } from '../../form-flow/useFieldFocus';
import { useFormPageController } from '../../form-flow/useFormPageController';
import styles from './SendinnJourney.module.css';

const SendinnJourney = () => {
  const { search } = useLocation();
  const { step } = useParams<'step'>();
  const navigate = useNavigate();
  const { translate, currentLanguage } = useLanguage();
  const { logger, environment } = useApplication();
  const { submission } = useSubmissionState();
  const form = useFormDefinitionForm();
  const panels = useFormDefinitionPanels();
  const { currentPanel, currentIndex, components, isFirst, isLast, goToNext } = useFormPageController(step);
  const { hideErrorSummary, schedulePageValidation, validatePages } = useValidationActions();
  const summary = step === SUMMARY_KEY;
  const hasDocuments = useMemo(
    () => flattenComponents(form.components).some((component) => component.type === 'attachment'),
    [form],
  );
  const pageKeys = useMemo(() => panels.map((panel) => panel.key), [panels]);
  const getPanelLink = useCallback(
    (panelKey: string) => {
      const params = new URLSearchParams(search);
      params.delete('step');
      return { pathname: `/${form.path}/${panelKey}`, search: params.size ? `?${params}` : '' };
    },
    [form.path, search],
  );
  const goToStep = (panelKey: string, focusId?: string) => {
    hideErrorSummary();
    navigate(getPanelLink(panelKey), { state: focusId ? { focusId } : undefined });
  };

  useFieldFocus({ preferInputFocus: true });
  useEffect(() => {
    document.title = translate(TEXTS.statiske.sendinn.journey.form);
  }, [translate]);
  useEffect(() => {
    if (!step && currentPanel) navigate(getPanelLink(currentPanel.key), { replace: true });
  }, [step, currentPanel, navigate, getPanelLink]);
  useEffect(() => {
    if (!summary && currentPanel) schedulePageValidation(currentPanel.key);
  }, [components, currentPanel, schedulePageValidation, summary]);

  const next = () => {
    if (!goToNext()) return;
    if (isLast) {
      goToStep(SUMMARY_KEY);
      return;
    }
    goToStep(panels[currentIndex + 1].key);
  };

  return (
    <div data-journey="form">
      <FormFlowLayout
        form={{ ...form, title: TEXTS.statiske.sendinn.journey.form }}
        pageTitle={summary ? TEXTS.statiske.summaryPage.title : (currentPanel?.title ?? form.title)}
        activeIndex={summary ? panels.length : currentIndex}
        leadingSteps={[]}
        navigationKey={summary ? SUMMARY_KEY : currentPanel?.key}
        onStepClick={(key) => goToStep(key)}
      >
        {!hasDocuments ? (
          <Alert variant="info">{translate(TEXTS.statiske.sendinn.noMatchingDocuments)}</Alert>
        ) : summary ? (
          <>
            <div className={styles.summary}>
              <RenderSummaryForm
                form={form}
                activeComponents={panels}
                submission={submission}
                currentLanguage={currentLanguage}
                translate={translate}
                rendererConfig={{ submissionMethod: 'paper', logger, environment }}
                getPanelLink={getPanelLink}
              />
            </div>
            <FormErrorSummary
              preferInputFocus
              pageKeys={pageKeys}
              onNavigateToField={(error, id) => goToStep(error.pageKey, id)}
            />
            <FormButtonRow
              previousButton={
                <FormPrevButton
                  label={translate(TEXTS.grensesnitt.navigation.previous)}
                  onClick={() => goToStep(panels[panels.length - 1].key)}
                />
              }
              nextButton={
                <FormNextButton
                  label={translate(TEXTS.statiske.sendinn.reviewAnswers)}
                  onClick={() => validatePages(pageKeys)}
                />
              }
            />
          </>
        ) : (
          <>
            <RenderInputForm pageKey={currentPanel?.key} components={components} />
            <FormErrorSummary preferInputFocus pageKey={currentPanel?.key} />
            <FormButtonRow
              previousButton={
                !isFirst && (
                  <FormPrevButton
                    label={translate(TEXTS.grensesnitt.navigation.previous)}
                    onClick={() => goToStep(panels[currentIndex - 1].key)}
                  />
                )
              }
              nextButton={<FormNextButton label={translate(TEXTS.grensesnitt.navigation.next)} onClick={next} />}
            />
          </>
        )}
      </FormFlowLayout>
    </div>
  );
};

export { SendinnJourney };
