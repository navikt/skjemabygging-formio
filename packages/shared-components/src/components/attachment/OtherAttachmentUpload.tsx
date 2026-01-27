import { PlusIcon } from '@navikt/aksel-icons';
import { BodyShort, Button, Label, VStack } from '@navikt/ds-react';
import {
  AttachmentSettingValues,
  attachmentUtils,
  ComponentValue,
  SubmissionAttachment,
  SubmissionAttachmentValue,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import clsx from 'clsx';
import { MutableRefObject, useState } from 'react';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import FileUploader from '../file-uploader/FileUploader';
import AttachmentOptionSelect from './AttachmentOptionSelect';
import { AttachmentError, useAttachmentUpload } from './AttachmentUploadContext';
import FileUploadReadMore from './FileUploadReadMore';
import { useAttachmentStyles } from './styles';
import {
  filterAttachmentsByComponentId,
  getDefaultOtherAttachment,
  getLargestAttachmentIdCounter,
} from './utils/attachmentUploadUtils';

interface Props {
  label: string;
  attachmentValues?: AttachmentSettingValues | ComponentValue[];
  componentId: string;
  description?: string;
  submissionAttachment?: SubmissionAttachment;
  onValueChange: (value?: Partial<SubmissionAttachmentValue>) => void;
  error?: AttachmentError;
  className?: string;
  refs?: MutableRefObject<Record<string, HTMLInputElement | HTMLFieldSetElement | HTMLButtonElement | null>>;
}

const OtherAttachmentUpload = ({
  label,
  attachmentValues,
  componentId,
  description,
  submissionAttachment,
  onValueChange,
  error,
  className,
  refs,
}: Props) => {
  const styles = useAttachmentStyles();
  const { translate } = useLanguages();
  const { handleDeleteAttachment, submissionAttachments } = useAttachmentUpload();
  const { form } = useForm();

  const defaultAttachmentValues: Pick<SubmissionAttachment, 'navId' | 'type'> = { navId: componentId, type: 'other' };
  const [attachments, setAttachments] = useState(
    submissionAttachment
      ? filterAttachmentsByComponentId(submissionAttachments, componentId)
      : [getDefaultOtherAttachment(componentId)],
  );
  const [attachmentCounter, setAttachmentCounter] = useState(getLargestAttachmentIdCounter(attachments));

  const uploadedAttachmentFiles = submissionAttachment?.files ?? [];
  const options = attachmentUtils.mapKeysToOptions(attachmentValues, translate);
  const uploadSelected = !!options.find((option) => option.value === submissionAttachment?.value)?.upload;

  const handleDelete = async (attachmentId: string) => {
    try {
      const submissionAttachment = submissionAttachments.find((att) => att.attachmentId === attachmentId);
      if ((submissionAttachment?.files ?? []).length > 0) {
        await handleDeleteAttachment(attachmentId);
      }
      setAttachments((current) => {
        if (current.length === 1) {
          const [{ value }] = current;
          return [getDefaultOtherAttachment(componentId, value)];
        }
        return current.filter((att) => att.attachmentId !== attachmentId);
      });
    } catch (_error) {
      /* error is handled at a higher level */
    }
  };

  const handleUploadAnotherAttachment = () => {
    setAttachments((current) => [
      ...current,
      { attachmentId: `${componentId}-${attachmentCounter + 1}`, ...defaultAttachmentValues },
    ]);
    setAttachmentCounter((value) => value + 1);
  };

  const showAddAnotherButton = () => {
    return attachments.every((otherAttachment) => {
      const fromSubmission = submissionAttachments.find(
        (submissionAttachment) => otherAttachment.attachmentId === submissionAttachment.attachmentId,
      );
      return (fromSubmission?.files ?? []).length > 0;
    });
  };

  return (
    <VStack gap="6" className={clsx('mb', className)}>
      {uploadedAttachmentFiles.length > 0 ? (
        <div>
          <Label className={'mb-0'}>{label}</Label>
          <BodyShort>{description}</BodyShort>
        </div>
      ) : (
        <AttachmentOptionSelect
          title={label}
          description={description}
          error={error?.message}
          value={submissionAttachment?.value ? { key: submissionAttachment.value } : undefined}
          attachmentValues={attachmentValues}
          onChange={onValueChange}
          translate={translate}
          deadline={form.properties?.ettersendelsesfrist}
          ref={(ref) => {
            if (refs?.current) {
              refs.current[`${componentId}-VALUE`] = ref;
            }
          }}
        />
      )}
      {uploadSelected && (
        <VStack gap="2">
          {uploadedAttachmentFiles.length > 0 && (
            <div className={styles.uploadedFilesHeader}>
              <Label>{translate(TEXTS.statiske.attachment.filesUploadedNotSent)}</Label>
            </div>
          )}

          <VStack gap="8">
            {attachments.map((attachment) => (
              <FileUploader
                key={attachment.attachmentId}
                initialAttachment={attachment}
                requireAttachmentTitle
                attachmentValue={submissionAttachment?.value}
                showDeleteAttachmentButton={attachments.length > 1}
                onDeleteAttachment={handleDelete}
                refs={refs}
                readMore={<FileUploadReadMore />}
              />
            ))}
            {showAddAnotherButton() && (
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
        </VStack>
      )}
    </VStack>
  );
};

export default OtherAttachmentUpload;
