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
import { attachmentValidator } from './attachmentValidator';
import { useAttachmentStyles } from './styles';

interface Props {
  label: string;
  attachmentValues?: AttachmentSettingValues | ComponentValue[];
  componentId: string;
  type?: Exclude<AttachmentType, 'other'>;
  description?: string;
  className?: string;
  refs?: MutableRefObject<Record<string, HTMLInputElement | HTMLFieldSetElement | HTMLButtonElement | null>>;
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

  const validator = attachmentValidator(translate, ['value']);
  const uploadedAttachmentFiles = attachment?.files ?? [];
  const options = attachmentUtils.mapKeysToOptions(attachmentValues, translate);
  const uploadSelected = !!options.find((option) => option.value === attachment?.value)?.upload;
  const attachmentError = errors[componentId]?.find((error) => error.type === 'VALUE');

  const handleValueChange = (value: Partial<SubmissionAttachmentValue>, attachmentId: string = componentId) => {
    changeAttachmentValue(
      { attachmentId, navId: componentId, type },
      { value: value.key, additionalDocumentation: value.additionalDocumentation },
      validator,
    );
  };

  const handleDeleteAllAttachments = async (attachmentId: string) => {
    await handleDeleteAttachment(attachmentId);
  };

  return (
    <VStack gap="6" className={clsx('mb', className)}>
      {uploadedAttachmentFiles.length > 0 ? (
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
          <FileUploader
            initialAttachment={{ attachmentId: componentId, navId: componentId, type }}
            refs={refs}
            multiple
          />
        </VStack>
      )}
    </VStack>
  );
};

export default AttachmentUpload;
