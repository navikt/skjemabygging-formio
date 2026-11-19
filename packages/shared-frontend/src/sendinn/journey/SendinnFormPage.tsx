import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect } from 'react';
import { useParams } from 'react-router';
import FormErrorSummary from '../../components/error-summary/FormErrorSummary';
import { useLanguage } from '../../context/language/LanguageContext';
import { useValidationActions } from '../../context/validation/ValidationContext';
import RenderInputForm from '../../form-components/RenderInputForm';
import { SUMMARY_KEY } from '../../form-flow/constants';
import { FormButtonRow, FormNextButton, FormPrevButton } from '../../form-flow/layout/FormButtonRow';
import { useFormPageController } from '../../form-flow/useFormPageController';
import { useSendinnStepNavigation } from './useSendinnStepNavigation';

const SendinnFormPage = () => {
  const { panelSlug } = useParams<{ panelSlug?: string }>();
  const { translate } = useLanguage();
  const { panels, currentPanel, currentIndex, components, isFirst, isLast, goToNext } =
    useFormPageController(panelSlug);
  const { schedulePageValidation } = useValidationActions();
  const goToStep = useSendinnStepNavigation();

  useEffect(() => {
    if (currentPanel) schedulePageValidation(currentPanel.key);
  }, [components, currentPanel, schedulePageValidation]);

  const next = () => {
    if (!goToNext()) return;
    goToStep(isLast ? SUMMARY_KEY : panels[currentIndex + 1].key);
  };

  return (
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
  );
};

export { SendinnFormPage };
