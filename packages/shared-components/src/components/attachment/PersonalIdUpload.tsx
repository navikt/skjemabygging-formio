import { Label, VStack } from '@navikt/ds-react';
import { SubmissionAttachmentValue, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguages } from '../../context/languages';
import FileUploader from '../file-uploader/FileUploader';
import Attachment from './Attachment';
import { useAttachmentUpload } from './AttachmentUploadContext';
import { attachmentValidator } from './attachmentValidator';

const PersonalIdUpload = ({ refs }: { refs?: any }) => {
  const { translate } = useLanguages();
  const { changeAttachmentValue, submissionAttachments, errors } = useAttachmentUpload();

  const options = [
    { value: 'norwegian-passport', label: translate(TEXTS.statiske.uploadId.norwegianPassport), upload: true },
    { value: 'foreign-passport', label: translate(TEXTS.statiske.uploadId.foreignPassport), upload: true },
    { value: 'national-id-eu', label: translate(TEXTS.statiske.uploadId.nationalIdEU), upload: true },
    { value: 'drivers-license', label: translate(TEXTS.statiske.uploadId.driversLicense), upload: true },
    { value: 'drivers-license-eu', label: translate(TEXTS.statiske.uploadId.driversLicenseEU), upload: true },
  ];
  const attachmentId = 'personal-id';
  const attachment = submissionAttachments.find((attachment) => attachment.attachmentId === attachmentId);
  const uploadedFile = attachment?.files?.[0];
  const uploadSelected = !!attachment?.value;
  const attachmentError = errors[attachmentId]?.find((error) => error.type === 'VALUE');

  const handleValueChange = (value: Partial<SubmissionAttachmentValue>) => {
    const title = options.find((option) => option.value === value.key)?.label;
    changeAttachmentValue(
      { attachmentId, navId: attachmentId, type: 'personal-id' },
      { value: value.key, title },
      attachmentValidator(translate, ['value']),
    );
  };

  return (
    <VStack gap="6" className={'mb'}>
      {!uploadedFile && (
        <Attachment
          title={translate(TEXTS.statiske.uploadId.label)}
          description={null}
          error={attachmentError?.message}
          value={attachment?.value ? { key: attachment.value } : undefined}
          attachmentValues={options}
          onChange={handleValueChange}
          translate={translate}
          ref={(ref) => {
            if (refs?.current) {
              refs.current[`${attachmentId}-INPUT`] = ref;
            }
          }}
        />
      )}
      {uploadSelected && (
        <VStack gap="4">
          {!uploadedFile && <Label>{translate(TEXTS.statiske.uploadId.selectFileLabel)}</Label>}
          <FileUploader
            initialAttachment={{ attachmentId, navId: attachmentId, type: 'personal-id' }}
            multiple={false}
          />
        </VStack>
      )}
    </VStack>
  );
};

export default PersonalIdUpload;
