import { Alert, BodyShort, ConfirmationPanel, Heading, VStack } from '@navikt/ds-react';
import {
  DeclarationType,
  formioFormsApiUtils,
  navFormUtils,
  PanelValidation,
  Submission,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useRef, useState } from 'react';
import { attachmentValidator } from '../../components/attachment/attachmentValidator';
import ButtonRow from '../../components/button/ButtonRow';
import EditAnswersButton from '../../components/button/navigation/edit-answers/EditAnswersButton';
import ValidationExclamationIcon from '../../components/icons/ValidationExclamationIcon';
import NavFormHelper from '../../components/nav-form/NavFormHelper';
import { useAppConfig } from '../../context/config/configContext';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import RenderSummaryForm from '../../form-components/RenderSummaryForm';
import { scrollToAndSetFocus } from '../../util/focus-management/focus-management';
import {
  findFirstValidationErrorInAttachmentPanel,
  validateWizardPanels,
} from '../../util/form/panel-validation/panelValidation';
import SummaryPageNavigation from './navigation/SummaryPageNavigation';

export function SummaryPage() {
  const appConfig = useAppConfig();
  const { translate, availableLanguages, currentLanguage } = useLanguages();
  const {
    prefillData,
    submission,
    form,
    setTitle,
    setFormProgressVisible,
    activeComponents,
    activeAttachmentUploadsPanel,
  } = useForm();
  const { declarationType, declarationText } = form.properties;
  const [declaration, setDeclaration] = useState<boolean | undefined>(undefined);

  const [panelValidationList, setPanelValidationList] = useState<PanelValidation[] | undefined>();

  useEffect(() => {
    const initializePanelValidation = async () => {
      const submissionCopy: Submission = JSON.parse(JSON.stringify(submission || {}));

      const formioSummary = document.getElementById('formio-summary-hidden')!;
      const webform = await NavFormHelper.create(formioSummary, form, {
        appConfig,
        submission: submissionCopy,
      });

      webform.form = NavFormHelper.prefillForm(webform.form, prefillData);

      webform.checkData(submissionCopy?.data, [], undefined);

      const panelValidations = validateWizardPanels(webform, form, submission!);

      if (form.introPage?.enabled && !submission?.selfDeclaration) {
        panelValidations.push({
          key: 'introPage',
          hasValidationErrors: true,
        });
      }

      const attachmentPanel = navFormUtils.getActiveAttachmentPanelFromForm(
        form,
        submission,
        appConfig.submissionMethod,
      );
      if (attachmentPanel) {
        const validator = attachmentValidator(translate, ['value', 'fileUploaded']);
        const invalidAttachment = findFirstValidationErrorInAttachmentPanel(
          attachmentPanel,
          submission ?? { data: {} },
          validator,
        );
        if (invalidAttachment) {
          panelValidations.push({
            key: attachmentPanel.key,
            hasValidationErrors: !!invalidAttachment,
            firstInputWithValidationError: invalidAttachment ? invalidAttachment.navId : undefined,
          });
        }
      }

      setPanelValidationList(panelValidations);
      webform.destroy(true);

      if (formioSummary) {
        formioSummary.innerHTML = '';
      }
    };

    if (availableLanguages.length > 0) {
      initializePanelValidation();
    }
  }, [form, submission, appConfig, prefillData, translate, availableLanguages]);

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
      {hasValidationErrors ? (
        <>
          <Alert variant="warning">
            <Heading spacing size="small" level="3">
              {translate(TEXTS.statiske.summaryPage.validationTitle)}
            </Heading>
            {translate(TEXTS.statiske.summaryPage.validationMessage)}
            <ValidationExclamationIcon title={translate(TEXTS.statiske.summaryPage.validationIcon)} />.
          </Alert>
          <ButtonRow>
            <EditAnswersButton form={form} panelValidationList={panelValidationList} />
          </ButtonRow>
        </>
      ) : (
        <BodyShort className="mb-4">{translate(TEXTS.statiske.summaryPage.description)}</BodyShort>
      )}
      <RenderSummaryForm
        activeComponents={activeComponents}
        activeAttachmentUploadsPanel={activeAttachmentUploadsPanel}
        submission={submission}
        form={formioFormsApiUtils.mapNavFormToForm(form)}
        currentLanguage={currentLanguage}
        translate={translate}
        panelValidationList={panelValidationList}
        appConfig={appConfig}
      />

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
        panelValidationList={panelValidationList}
        isValid={isValid}
      />

      <div id="formio-summary-hidden" hidden />
    </VStack>
  );
}
