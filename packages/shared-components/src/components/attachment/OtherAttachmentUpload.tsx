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
}

const OtherAttachmentUpload = ({ label, attachmentValues, componentId, description, className }: Props) => {
  const styles = useAttachmentStyles();
  const { translate } = useLanguages();
  const { changeAttachmentValue, handleDeleteAttachment, submissionAttachments, errors } = useAttachmentUpload();
  const { form } = useForm();

  const otherAttachment = submissionAttachments.find((attachment) => attachment.attachmentId.startsWith(componentId));
  const [attachments, setAttachments] = useState(
    otherAttachment
      ? submissionAttachments.filter((att) => att.attachmentId.startsWith(componentId))
      : [{ attachmentId: componentId }],
  );

  const uploadedAttachmentFiles = otherAttachment?.files ?? [];
  const options = attachmentUtils.mapKeysToOptions(attachmentValues, translate);
  const uploadSelected = !!options.find((option) => option.value === otherAttachment?.value)?.upload;
  const error = errors[componentId];

  const handleValueChange = (value: Partial<SubmissionAttachmentValue>, attachmentId: string = componentId) => {
    changeAttachmentValue(attachmentId, value.key);
  };

  const handleDeleteAllAttachments = async (attachmentId: string) => {
    await handleDeleteAttachment(attachmentId);
  };

  const handleUploadAnotherAttachment = () => {
    setAttachments((current) => [...current, { attachmentId: `${componentId}-${current.length}` }]);
  };

  return (
    <VStack gap="8" className={clsx('mb', className)}>
      <Attachment
        title={label}
        description={description}
        error={error?.type === 'INPUT' && error.message}
        value={otherAttachment?.value ? { key: otherAttachment.value } : undefined}
        hideOptions={uploadedAttachmentFiles.length > 0}
        attachmentValues={attachmentValues}
        onChange={handleValueChange}
        translate={translate}
        deadline={form.properties?.ettersendelsesfrist}
      />
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

          {attachments.map((attachment) => (
            <FileUploader
              key={attachment.attachmentId}
              attachmentId={attachment.attachmentId}
              requireDescription
              attachmentValue={otherAttachment?.value}
            />
          ))}
          <Button
            variant="tertiary"
            onClick={handleUploadAnotherAttachment}
            className={styles.addAnotherAttachmentButton}
            icon={<PlusIcon aria-hidden fontSize="1.5rem" />}
          >
            {translate(TEXTS.statiske.attachment.addNewAttachment)}
          </Button>
        </VStack>
      )}
    </VStack>
  );
};

export default OtherAttachmentUpload;
