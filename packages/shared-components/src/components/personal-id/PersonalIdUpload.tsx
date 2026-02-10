import { Label, VStack } from '@navikt/ds-react';
import { SubmissionAttachmentValue, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguages } from '../../context/languages';
import Attachment from '../attachment/Attachment';
import { useAttachmentUpload } from '../attachment/AttachmentUploadContext';
import { attachmentValidator } from '../attachment/attachmentValidator';
import FileUploader from '../file-uploader/FileUploader';
import PersonalIdUploadReadMore from './PersonalIdUploadReadMore';

const PersonalIdUpload = ({ refs }: { refs?: any }) => {
  const { translate } = useLanguages();
  const { changeAttachmentValue, submissionAttachments, errors } = useAttachmentUpload();

  const options = [
    { value: 'norwegianPassport', label: translate(TEXTS.statiske.uploadId.norwegianPassport), upload: true },
    { value: 'foreignPassport', label: translate(TEXTS.statiske.uploadId.foreignPassport), upload: true },
    { value: 'nationalIdEU', label: translate(TEXTS.statiske.uploadId.nationalIdEU), upload: true },
    { value: 'driversLicense', label: translate(TEXTS.statiske.uploadId.driversLicense), upload: true },
    { value: 'driversLicenseEU', label: translate(TEXTS.statiske.uploadId.driversLicenseEU), upload: true },
  ];
  const attachmentId = 'personal-id';
  const attachment = submissionAttachments.find((attachment) => attachment.attachmentId === attachmentId);
  const uploadedFile = attachment?.files?.[0];
  const uploadSelected = !!attachment?.value;
  const attachmentError = errors[attachmentId]?.find((error) => error.type === 'VALUE');

  const handleValueChange = (value: Partial<SubmissionAttachmentValue> | undefined) => {
    const title = options.find((option) => option.value === value?.key)?.label;
    changeAttachmentValue(
      { attachmentId, navId: attachmentId, type: 'personal-id' },
      value ? { value: value.key, title } : {},
      attachmentValidator(translate, ['value']),
    );
  };

  return (
    <VStack gap="space-24" className={'mb'}>
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
              refs.current[`${attachmentId}-VALUE`] = ref;
            }
          }}
        />
      )}
      {uploadSelected && (
        <VStack gap="space-8">
          {!uploadedFile && <Label>{translate(TEXTS.statiske.uploadId.selectFileLabel)}</Label>}
          <FileUploader
            initialAttachment={{ attachmentId, navId: attachmentId, type: 'personal-id' }}
            multiple={false}
            readMore={<PersonalIdUploadReadMore />}
          />
        </VStack>
      )}
    </VStack>
  );
};

export default PersonalIdUpload;
