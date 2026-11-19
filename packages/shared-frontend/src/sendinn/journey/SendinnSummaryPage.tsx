import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo } from 'react';
import FormErrorSummary from '../../components/error-summary/FormErrorSummary';
import { useApplication } from '../../context/application/ApplicationContext';
import { useFormDefinitionForm, useFormDefinitionPanels } from '../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../context/language/LanguageContext';
import { useSubmissionState } from '../../context/state/SubmissionStateContext';
import { useValidationActions } from '../../context/validation/ValidationContext';
import RenderSummaryForm from '../../form-components/RenderSummaryForm';
import { FormButtonRow, FormNextButton, FormPrevButton } from '../../form-flow/layout/FormButtonRow';
import styles from './SendinnSummaryPage.module.css';
import { useSendinnStepNavigation } from './useSendinnStepNavigation';

const SendinnSummaryPage = () => {
  const { translate, currentLanguage } = useLanguage();
  const { logger, environment } = useApplication();
  const { submission } = useSubmissionState();
  const form = useFormDefinitionForm();
  const panels = useFormDefinitionPanels();
  const { validatePages } = useValidationActions();
  const goToStep = useSendinnStepNavigation();
  const pageKeys = useMemo(() => panels.map((panel) => panel.key), [panels]);

  return (
    <>
      <div className={styles.summary}>
        <RenderSummaryForm
          form={form}
          activeComponents={panels}
          submission={submission}
          currentLanguage={currentLanguage}
          translate={translate}
          rendererConfig={{ submissionMethod: 'paper', logger, environment }}
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
  );
};

export { SendinnSummaryPage };
