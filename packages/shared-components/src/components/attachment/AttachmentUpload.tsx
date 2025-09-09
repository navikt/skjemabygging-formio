import { BodyShort, Button, Label, VStack } from '@navikt/ds-react';
import {
  AttachmentSettingValues,
  attachmentUtils,
  ComponentValue,
  SubmissionAttachmentValue,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import clsx from 'clsx';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import FileUploader from '../file-uploader/FileUploader';
import Attachment from './Attachment';
import { useAttachmentUpload } from './AttachmentUploadContext';
import { useAttachmentStyles } from './styles';

interface Props {
  label: string;
  attachmentValues?: AttachmentSettingValues | ComponentValue[];
  componentId: string;
  description?: string;
  className?: string;
}

const AttachmentUpload = ({ label, attachmentValues, componentId, description, className }: Props) => {
  const styles = useAttachmentStyles();
  const { translate } = useLanguages();
  const { changeAttachmentValue, handleDeleteAttachment, submissionAttachments, errors } = useAttachmentUpload();
  const { form } = useForm();
  const attachment = submissionAttachments.find((attachment) => attachment.attachmentId.startsWith(componentId));

  const idUpload = componentId === 'personal-id';
  const uploadedAttachmentFiles = attachment?.files ?? [];
  const idUploaded = idUpload && uploadedAttachmentFiles.length > 0;
  const options = attachmentUtils.mapKeysToOptions(attachmentValues, translate);
  const uploadSelected = !!options.find((option) => option.value === attachment?.value)?.upload;
  const error = errors[componentId];

  const handleValueChange = (value: Partial<SubmissionAttachmentValue>, attachmentId: string = componentId) => {
    if (idUpload) {
      changeAttachmentValue(attachmentId, value.key, options.find((option) => option.value === value.key)?.label);
    } else {
      changeAttachmentValue(attachmentId, value.key, value.additionalDocumentation);
    }
  };

  const handleDeleteAllAttachments = async (attachmentId: string) => {
    await handleDeleteAttachment(attachmentId);
  };

  return (
    <VStack gap="8" className={clsx('mb', className)}>
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
            error={error?.type === 'INPUT' && error.message}
            value={
              attachment?.value
                ? { key: attachment.value, additionalDocumentation: attachment?.description }
                : undefined
            }
            attachmentValues={attachmentValues}
            onChange={handleValueChange}
            translate={translate}
            deadline={form.properties?.ettersendelsesfrist}
          />
        ))}
      {uploadSelected && (
        <VStack gap="4">
          <div className={styles.uploadedFilesHeader}>
            {uploadedAttachmentFiles.length > 0 && (
              <Label>{translate(TEXTS.statiske.attachment.filesUploadedNotSent)}</Label>
            )}
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
          {idUpload && <Label>{translate(TEXTS.statiske.uploadId.selectFileLabel)}</Label>}
          <FileUploader attachmentId={componentId} multiple={!idUpload} />
        </VStack>
      )}
    </VStack>
  );
};

export default AttachmentUpload;
