import { PlusIcon } from '@navikt/aksel-icons';
import { Button, Label, VStack } from '@navikt/ds-react';
import {
  AttachmentSettingValues,
  attachmentUtils,
  ComponentValue,
  SubmissionAttachmentValue,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import clsx from 'clsx';
import { useState } from 'react';
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
  otherAttachment?: boolean;
}

const AttachmentUpload = ({ label, attachmentValues, componentId, description, className, otherAttachment }: Props) => {
  const styles = useAttachmentStyles();
  const { translate } = useLanguages();
  const { changeAttachmentValue, handleDeleteAttachment, submissionAttachments, errors } = useAttachmentUpload();
  const { form } = useForm();
  const attachment = submissionAttachments.find((attachment) => attachment.attachmentId === componentId);
  const [value, setValue] = useState<keyof AttachmentSettingValues | undefined>(attachment?.value);
  const [descriptionText, setDescriptionText] = useState(attachment?.description);
  const [otherAttachments, setOtherAttachments] = useState(1);

  const isIdUpload = componentId === 'personal-id';
  const uploadedAttachmentFiles = attachment?.files ?? [];
  const idUploaded = isIdUpload && uploadedAttachmentFiles.length > 0;
  const options = attachmentUtils.mapKeysToOptions(attachmentValues, translate);
  const uploadSelected = !!options.find((option) => option.value === value)?.upload;
  const error = errors[componentId];

  const handleValueChange = (value: Partial<SubmissionAttachmentValue>, attachmentId: string = componentId) => {
    setValue(value.key);
    setDescriptionText(value?.additionalDocumentation);
    if (isIdUpload) {
      changeAttachmentValue(attachmentId, undefined, options.find((option) => option.value === value.key)?.label);
    } else if (otherAttachment) {
      // For "other" attachment, we allow multiple attachments with different descriptions
      // This is handled in each FileUploader instance
    } else {
      changeAttachmentValue(attachmentId, value.key, value.additionalDocumentation);
    }
  };

  const handleDeleteAllAttachments = async (attachmentId: string) => {
    await handleDeleteAttachment(attachmentId);
  };

  const handleUploadAnotherAttachment = () => {
    setOtherAttachments((current) => current + 1);
  };

  return (
    <VStack gap="8" className={clsx('mb', className)}>
      {!idUploaded && (
        <Attachment
          title={label}
          description={description}
          error={error?.type === 'INPUT' && error.message}
          value={value ? { key: value, additionalDocumentation: descriptionText } : undefined}
          hideOptions={uploadedAttachmentFiles.length > 0}
          attachmentValues={attachmentValues}
          onChange={handleValueChange}
          translate={translate}
          deadline={form.properties?.ettersendelsesfrist}
        />
      )}
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

          {isIdUpload && <Label>{translate(TEXTS.statiske.uploadId.selectFileLabel)}</Label>}

          {!otherAttachment && <FileUploader attachmentId={componentId} multiple={!isIdUpload} />}

          {otherAttachment &&
            Array.from({ length: otherAttachments }, (_, idx) => {
              return (
                <FileUploader
                  key={`${componentId}-${idx}`}
                  attachmentId={`${componentId}-${idx}`}
                  requireDescription
                  attachmentValue={value}
                />
              );
            })}
          {otherAttachment && (
            <Button
              variant="tertiary"
              onClick={handleUploadAnotherAttachment}
              className={styles.addAnotherAttachmentButton}
              icon={<PlusIcon aria-hidden fontSize="1.5rem" />}
            >
              {translate(TEXTS.statiske.attachment.addNewAttachment)}
            </Button>
          )}
        </VStack>
      )}
    </VStack>
  );
};

export default AttachmentUpload;
