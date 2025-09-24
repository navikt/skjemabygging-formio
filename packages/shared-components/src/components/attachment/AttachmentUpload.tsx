import { BodyShort, Button, Label, VStack } from '@navikt/ds-react';
import {
  AttachmentSettingValues,
  AttachmentType,
  attachmentUtils,
  ComponentValue,
  SubmissionAttachmentValue,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import clsx from 'clsx';
import { MutableRefObject } from 'react';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import FileUploader from '../file-uploader/FileUploader';
import Attachment from './Attachment';
import { useAttachmentUpload } from './AttachmentUploadContext';
import { useAttachmentStyles } from './styles';

import { attachmentValidator } from './attachmentValidator';

interface Props {
  label: string;
  attachmentValues?: AttachmentSettingValues | ComponentValue[];
  componentId: string;
  type?: Exclude<AttachmentType, 'other'> | 'personal-id';
  description?: string;
  className?: string;
  refs?: MutableRefObject<Record<string, HTMLInputElement | HTMLFieldSetElement | null>>;
}

const AttachmentUpload = ({
  label,
  attachmentValues,
  componentId,
  type = 'default',
  description,
  className,
  refs,
}: Props) => {
  const styles = useAttachmentStyles();
  const { translate } = useLanguages();
  const { changeAttachmentValue, handleDeleteAttachment, submissionAttachments, errors } = useAttachmentUpload();
  const { form } = useForm();
  const attachment = submissionAttachments.find((attachment) => attachment.attachmentId.startsWith(componentId));

  const uploadedAttachmentFiles = attachment?.files ?? [];
  const idUploaded = type === 'personal-id' && uploadedAttachmentFiles.length > 0;
  const options = attachmentUtils.mapKeysToOptions(attachmentValues, translate);
  const uploadSelected = !!options.find((option) => option.value === attachment?.value)?.upload;
  const attachmentError = errors[componentId]?.find((error) => error.type === 'VALUE');

  const handleValueChange = (value: Partial<SubmissionAttachmentValue>, attachmentId: string = componentId) => {
    if (type === 'personal-id') {
      const title = options.find((option) => option.value === value.key)?.label;
      changeAttachmentValue(
        { attachmentId, navId: componentId, type },
        { value: value.key, title },
        attachmentValidator(translate),
      );
    } else {
      changeAttachmentValue(
        { attachmentId, navId: componentId, type },
        { value: value.key, additionalDocumentation: value.additionalDocumentation },
      );
    }
  };

  const handleDeleteAllAttachments = async (attachmentId: string) => {
    await handleDeleteAttachment(attachmentId);
  };

  return (
    <VStack gap="6" className={clsx('mb', className)}>
      {!idUploaded &&
        (uploadedAttachmentFiles.length > 0 ? (
          <div>
            <Label>{label}</Label>
            <BodyShort>{description}</BodyShort>
          </div>
        ) : (
          <Attachment
            title={label}
            description={description}
            error={attachmentError?.message}
            value={
              attachment?.value
                ? { key: attachment.value, additionalDocumentation: attachment?.additionalDocumentation }
                : undefined
            }
            attachmentValues={attachmentValues}
            onChange={handleValueChange}
            translate={translate}
            deadline={form.properties?.ettersendelsesfrist}
            ref={(ref) => {
              if (refs?.current) {
                refs.current[`${componentId}-INPUT`] = ref;
              }
            }}
          />
        ))}
      {uploadSelected && (
        <VStack gap="4">
          {uploadedAttachmentFiles.length > 0 && (
            <div className={styles.uploadedFilesHeader}>
              <Label>{translate(TEXTS.statiske.attachment.filesUploadedNotSent)}</Label>
              {uploadedAttachmentFiles.length > 1 && (
                <Button
                  variant="tertiary"
                  onClick={() => handleDeleteAllAttachments(componentId)}
                  className={styles.deleteAllButton}
                >
                  {translate(TEXTS.statiske.attachment.deleteAllFiles)}
                </Button>
              )}
            </div>
          )}
          {type === 'personal-id' && <Label>{translate(TEXTS.statiske.uploadId.selectFileLabel)}</Label>}
          <FileUploader
            initialAttachment={{ attachmentId: componentId, navId: componentId, type }}
            multiple={type !== 'personal-id'}
          />
        </VStack>
      )}
    </VStack>
  );
};

export default AttachmentUpload;
