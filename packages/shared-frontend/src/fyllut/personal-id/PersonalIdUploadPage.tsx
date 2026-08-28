import { BodyShort, Label, VStack } from '@navikt/ds-react';
import { ComponentValue, SubmissionAttachmentValue, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useLocation, useNavigate } from 'react-router';
import { useFormDefinition } from '../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../context/language/LanguageContext';
import { useSubmissionMethod } from '../../context/submission-method/SubmissionMethodContext';
import { useValidation } from '../../context/validation/ValidationContext';
import AttachmentOptionSelect from '../attachments/components/AttachmentOptionSelect';
import FileUploader from '../attachments/components/FileUploader';
import { useAttachmentUpload } from '../attachments/context/AttachmentUploadContext';
import { useFyllut } from '../context/fyllut/FyllutContext';
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

const PersonalIdUploadPage = () => {
  const { form } = useFormDefinition();
  const { translate } = useLanguage();
  const { submissionMethod } = useSubmissionMethod();
  const { search } = useLocation();
  const navigate = useNavigate();
  const { addError, changeAttachmentValue, submissionAttachments } = useAttachmentUpload();
  const { getAttachmentExternalError } = useValidation();
  const { logEvent } = useFyllut();
  const attachment = submissionAttachments.find((item) => item.attachmentId === PERSONAL_ID_ATTACHMENT_ID);
  const attachmentValueError = getAttachmentExternalError(PERSONAL_ID_ATTACHMENT_ID, 'value');

  const changeAttachment = (value: SubmissionAttachmentValue | undefined) => {
    const title = identityDocumentOptions.find((option) => option.value === value?.key)?.label;
    changeAttachmentValue(
      { attachmentId: PERSONAL_ID_ATTACHMENT_ID, navId: PERSONAL_ID_ATTACHMENT_ID, type: PERSONAL_ID_ATTACHMENT_ID },
      value ? { value: value.key, title } : {},
    );
  };

  const continueToForm = () => {
    if (!attachment?.value) {
      addError(
        PERSONAL_ID_ATTACHMENT_ID,
        translate('required', { field: translate(TEXTS.statiske.uploadId.label) }),
        'VALUE',
      );
      return;
    }
    if (!attachment.files?.length) {
      addError(PERSONAL_ID_ATTACHMENT_ID, TEXTS.statiske.uploadId.missingUploadError, 'FILE');
      return;
    }
    navigate({ pathname: `/${form.path}`, search });
  };

  return (
    <>
      <FormHeader form={form} pageTitle={TEXTS.statiske.uploadId.title} />
      <VStack gap="space-32">
        <BodyShort>{translate(TEXTS.statiske.uploadId.description)}</BodyShort>
        <VStack gap="space-24">
          {!attachment?.files?.length && (
            <AttachmentOptionSelect
              attachmentNavId={PERSONAL_ID_ATTACHMENT_ID}
              attachmentValues={identityDocumentOptions}
              description=""
              error={attachmentValueError}
              onChange={changeAttachment}
              required
              submissionMethod={submissionMethod}
              title={translate(TEXTS.statiske.uploadId.label)}
              translate={translate}
              value={attachment?.value ? { key: attachment.value } : undefined}
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
                onUpload={(uploadedAttachment) => {
                  void logEvent?.({
                    name: 'last opp',
                    data: {
                      type: 'vedlegg',
                      skjemaId: form.properties.skjemanummer,
                      tema: form.properties.tema,
                      tittel: translate(TEXTS.statiske.uploadId.label),
                      attachmentId: uploadedAttachment.attachmentId,
                      submissionMethod,
                    },
                  });
                }}
                readMore={<PersonalIdUploadReadMore />}
              />
            </VStack>
          )}
        </VStack>
      </VStack>
      <FormButtonRow
        cancelButton={<CancelAndDeleteButton />}
        nextButton={<FormNextButton label={translate(TEXTS.grensesnitt.navigation.next)} onClick={continueToForm} />}
      />
    </>
  );
};

export default PersonalIdUploadPage;
