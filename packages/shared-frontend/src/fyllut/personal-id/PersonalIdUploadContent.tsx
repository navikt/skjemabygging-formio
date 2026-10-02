import { BodyShort, Label, VStack } from '@navikt/ds-react';
import { ComponentValue, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useLocation, useNavigate } from 'react-router';
import { attachmentFieldPath } from '../../components/attachment/attachmentFieldPath';
import FileUploader from '../../components/attachment/AttachmentItem';
import { AttachmentChoice } from '../../components/attachment/attachmentOptions';
import AttachmentOptionSelect from '../../components/attachment/AttachmentOptionSelect';
import { toAttachmentValueValidationFields } from '../../components/attachment/attachmentValidation';
import FormErrorSummary from '../../components/error-summary/FormErrorSummary';
import { useAttachmentUpload } from '../../context/attachment/AttachmentUploadContext';
import {
  useFormDefinitionForm,
  useFormDefinitionSubmissionMethod,
} from '../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../context/language/LanguageContext';
import { useSubmissionState } from '../../context/state/SubmissionStateContext';
import {
  useValidationActions,
  useValidationExternalError,
  useValidationFieldError,
} from '../../context/validation/ValidationContext';
import ValidationRegistration from '../../context/validation/ValidationRegistration';
import { FormButtonRow, FormNextButton } from '../layout/FormButtonRow';
import FormHeader from '../layout/FormHeader';
import CancelAndDeleteButton from '../navigation/CancelAndDeleteButton';
import PersonalIdUploadReadMore from './PersonalIdUploadReadMore';

const PERSONAL_ID_ATTACHMENT_ID = 'personal-id';

const identityDocumentOptions: ComponentValue[] = [
  { value: 'norwegianPassport', label: TEXTS.statiske.uploadId.norwegianPassport, upload: true },
  { value: 'foreignPassport', label: TEXTS.statiske.uploadId.foreignPassport, upload: true },
  { value: 'nationalIdEU', label: TEXTS.statiske.uploadId.nationalIdEU, upload: true },
  { value: 'driversLicense', label: TEXTS.statiske.uploadId.driversLicense, upload: true },
  { value: 'driversLicenseEU', label: TEXTS.statiske.uploadId.driversLicenseEU, upload: true },
];

const PersonalIdUploadContent = () => {
  const form = useFormDefinitionForm();
  const { translate } = useLanguage();
  const submissionMethod = useFormDefinitionSubmissionMethod();
  const { search } = useLocation();
  const navigate = useNavigate();
  const { submission } = useSubmissionState();
  const { changeAttachmentValue } = useAttachmentUpload();
  const { validatePage } = useValidationActions();
  const attachment = submission?.attachments?.find((item) => item.attachmentId === PERSONAL_ID_ATTACHMENT_ID);
  const attachmentValueError = useValidationExternalError(
    attachmentFieldPath(undefined, PERSONAL_ID_ATTACHMENT_ID, 'value'),
  );
  const validationError = useValidationFieldError(
    attachmentFieldPath(undefined, PERSONAL_ID_ATTACHMENT_ID, 'value'),
    PERSONAL_ID_ATTACHMENT_ID,
  );
  const fields = toAttachmentValueValidationFields({
    attachmentId: PERSONAL_ID_ATTACHMENT_ID,
    label: TEXTS.statiske.uploadId.label,
    required: true,
    attachment,
  });

  const changeAttachment = (value: AttachmentChoice | undefined) => {
    const title = identityDocumentOptions.find((option) => option.value === value?.value)?.label;
    changeAttachmentValue(
      { attachmentId: PERSONAL_ID_ATTACHMENT_ID, navId: PERSONAL_ID_ATTACHMENT_ID, type: PERSONAL_ID_ATTACHMENT_ID },
      { value: value?.value, title },
    );
  };

  const continueToForm = () => {
    if (!validatePage(PERSONAL_ID_ATTACHMENT_ID)) return;
    navigate({ pathname: `/${form.path}`, search });
  };

  return (
    <>
      <FormHeader form={form} pageTitle={TEXTS.statiske.uploadId.title} />
      {fields.map((field) => (
        <ValidationRegistration
          key={field.statePath}
          label={field.field}
          statePath={field.statePath}
          value={field.value}
          rules={field.rules}
        />
      ))}
      <VStack gap="space-32">
        <BodyShort>{translate(TEXTS.statiske.uploadId.description)}</BodyShort>
        <VStack gap="space-24">
          {!attachment?.files?.length && (
            <AttachmentOptionSelect
              attachmentId={PERSONAL_ID_ATTACHMENT_ID}
              values={identityDocumentOptions.map((option) => ({ ...option, label: translate(option.label) }))}
              description=""
              error={validationError ?? attachmentValueError}
              onChange={changeAttachment}
              required
              uploadEnabled
              title={translate(TEXTS.statiske.uploadId.label)}
              translate={translate}
              value={attachment}
            />
          )}
          {!!attachment?.value && (
            <VStack gap="space-8">
              {!attachment.files?.length && <Label>{translate(TEXTS.statiske.uploadId.selectFileLabel)}</Label>}
              <FileUploader
                initialAttachment={{
                  attachmentId: PERSONAL_ID_ATTACHMENT_ID,
                  navId: PERSONAL_ID_ATTACHMENT_ID,
                  type: PERSONAL_ID_ATTACHMENT_ID,
                }}
                multiple={false}
                attachmentLabel={TEXTS.statiske.uploadId.label}
                requiredFilesMessage={TEXTS.statiske.uploadId.missingUploadError}
                downloadEnabled={submissionMethod === 'digital'}
                readMore={<PersonalIdUploadReadMore />}
              />
            </VStack>
          )}
        </VStack>
      </VStack>
      <FormErrorSummary pageKey={PERSONAL_ID_ATTACHMENT_ID} />
      <FormButtonRow
        cancelButton={<CancelAndDeleteButton />}
        nextButton={<FormNextButton label={translate(TEXTS.grensesnitt.navigation.next)} onClick={continueToForm} />}
      />
    </>
  );
};

export default PersonalIdUploadContent;
