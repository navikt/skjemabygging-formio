import { Alert, BodyShort, ConfirmationPanel, Heading, VStack } from '@navikt/ds-react';
import { DeclarationType, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useRef, useState } from 'react';
import EditAnswersButton from '../../components/button/navigation/edit-answers/EditAnswersButton';
import ValidationExclamationIcon from '../../components/icons/ValidationExclamationIcon';
import NavFormHelper from '../../components/nav-form/NavFormHelper';
import { useAppConfig } from '../../context/config/configContext';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import FormSummary from '../../form-components/FormSummary';
import { scrollToAndSetFocus } from '../../util/focus-management/focus-management';
import { PanelValidation, validateWizardPanels } from '../../util/form/panel-validation/panelValidation';
import SummaryPageNavigation from './navigation/SummaryPageNavigation';

export function SummaryPage() {
  const appConfig = useAppConfig();
  const { translate } = useLanguages();
  const { prefillData, submission, formUrl, form, setTitle, setFormProgressVisible } = useForm();
  const { declarationType, declarationText } = form.properties;
  const [declaration, setDeclaration] = useState<boolean | undefined>(undefined);

  const [panelValidationList, setPanelValidationList] = useState<PanelValidation[] | undefined>();

  useEffect(() => {
    const initializePanelValidation = async () => {
      const submissionCopy = JSON.parse(JSON.stringify(submission || {}));

      const formioSummary = document.getElementById('formio-summary-hidden')!;
      const webform = await NavFormHelper.create(formioSummary, form, {
        appConfig,
        submission: submissionCopy,
      });

      webform.form = NavFormHelper.prefillForm(webform.form, prefillData);

      webform.checkData(submissionCopy?.data, [], undefined);

      const panelValidations = validateWizardPanels(webform, form, submission!);

      setPanelValidationList(panelValidations);
      webform.destroy(true);

      if (formioSummary) {
        formioSummary.innerHTML = '';
      }
    };

    initializePanelValidation();
  }, [form, submission, appConfig, prefillData]);

  useEffect(() => {
    setTitle(TEXTS.statiske.summaryPage.title);
    setFormProgressVisible(true);
  }, [setTitle, setFormProgressVisible]);

  useEffect(() => scrollToAndSetFocus('main', 'start'), []);
  const declarationRef = useRef<HTMLInputElement>(null);

  const hasDeclaration = declarationType === DeclarationType.custom || declarationType === DeclarationType.default;

  const isValid = (e: React.MouseEvent<HTMLElement>) => {
    if (hasDeclaration && !declaration) {
      if (declaration === undefined) {
        setDeclaration(false);
      }

      e.preventDefault();
      declarationRef.current?.focus();
      return false;
    }

    return true;
  };

  const hasValidationErrors = panelValidationList?.some((panelValidation) => panelValidation.hasValidationErrors);

  return (
    <VStack gap="8">
      {!hasValidationErrors && (
        <BodyShort className="mb-4">{translate(TEXTS.statiske.summaryPage.description)}</BodyShort>
      )}
      {hasValidationErrors && (
        <>
          <Alert variant="warning">
            <Heading spacing size="small" level="3">
              {translate(TEXTS.statiske.summaryPage.validationTitle)}
            </Heading>
            {translate(TEXTS.statiske.summaryPage.validationMessage)}
            <ValidationExclamationIcon title={translate(TEXTS.statiske.summaryPage.validationIcon)} />.
          </Alert>
          <div className="button-row">
            <EditAnswersButton form={form} formUrl={formUrl} panelValidationList={panelValidationList} />
          </div>
        </>
      )}
      <FormSummary panelValidationList={panelValidationList} />
      {hasDeclaration && (
        <ConfirmationPanel
          className="mb"
          checked={declaration || false}
          error={declaration === false && translate(TEXTS.statiske.summaryPage.confirmationError)}
          label={
            declarationType === DeclarationType.custom
              ? translate(declarationText)
              : translate(TEXTS.statiske.declaration.defaultText)
          }
          ref={declarationRef}
          onChange={() => {
            setDeclaration((v) => !v);
          }}
        />
      )}
      <SummaryPageNavigation
        form={form}
        submission={submission}
        formUrl={formUrl}
        panelValidationList={panelValidationList}
        isValid={isValid}
      />

      <div id="formio-summary-hidden" hidden />
    </VStack>
  );
}
