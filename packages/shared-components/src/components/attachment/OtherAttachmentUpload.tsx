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
import Attachment from './Attachment';
import { useAttachmentUpload } from './AttachmentUploadContext';
import { attachmentValidator } from './attachmentValidator';
import FileUploadReadMore from './FileUploadReadMore';
import { useAttachmentStyles } from './styles';

interface Props {
  label: string;
  attachmentValues?: AttachmentSettingValues | ComponentValue[];
  componentId: string;
  description?: string;
  className?: string;
  refs?: MutableRefObject<Record<string, HTMLInputElement | HTMLFieldSetElement | HTMLButtonElement | null>>;
}

const OtherAttachmentUpload = ({ label, attachmentValues, componentId, description, className, refs }: Props) => {
  const styles = useAttachmentStyles();
  const { translate } = useLanguages();
  const { changeAttachmentValue, handleDeleteAttachment, submissionAttachments, errors } = useAttachmentUpload();
  const { form } = useForm();

  const validator = attachmentValidator(translate, ['value']);
  const defaultAttachmentValues: Pick<SubmissionAttachment, 'navId' | 'type'> = { navId: componentId, type: 'other' };
  const otherAttachment = submissionAttachments.find((attachment) => attachment.attachmentId.startsWith(componentId));
  const [attachmentCounter, setAttachmentCounter] = useState(0);
  const [attachments, setAttachments] = useState(
    otherAttachment
      ? submissionAttachments.filter((att) => att.attachmentId.startsWith(componentId))
      : [{ attachmentId: componentId, ...defaultAttachmentValues }],
  );

  const uploadedAttachmentFiles = otherAttachment?.files ?? [];
  const options = attachmentUtils.mapKeysToOptions(attachmentValues, translate);
  const uploadSelected = !!options.find((option) => option.value === otherAttachment?.value)?.upload;
  const attachmentError = errors[componentId]?.find((error) => error.type === 'VALUE');

  const handleValueChange = (value: Partial<SubmissionAttachmentValue>, attachmentId: string = componentId) => {
    changeAttachmentValue({ attachmentId, ...defaultAttachmentValues }, { value: value.key }, validator);
  };

  const handleDelete = async (attachmentId: string) => {
    try {
      const submissionAttachment = submissionAttachments.find((att) => att.attachmentId === attachmentId);
      if ((submissionAttachment?.files ?? []).length > 0) {
        await handleDeleteAttachment(attachmentId);
      }
      setAttachments((current) => {
        if (current.length === 1) {
          const [{ value }] = current;
          return [{ attachmentId: componentId, value, ...defaultAttachmentValues }];
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
        <Attachment
          title={label}
          description={description}
          error={attachmentError?.message}
          value={otherAttachment?.value ? { key: otherAttachment.value } : undefined}
          attachmentValues={attachmentValues}
          onChange={handleValueChange}
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
                attachmentValue={otherAttachment?.value}
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
