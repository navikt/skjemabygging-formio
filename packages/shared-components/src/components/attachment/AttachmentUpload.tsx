import { BodyShort, Button, Label, VStack } from '@navikt/ds-react';
import {
  AttachmentSettingValues,
  AttachmentType,
  attachmentUtils,
  ComponentValue,
  SubmissionAttachment,
  SubmissionAttachmentValue,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import clsx from 'clsx';
import { MutableRefObject, ReactNode } from 'react';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import FileUploader from '../file-uploader/FileUploader';
import AttachmentOptionSelect from './AttachmentOptionSelect';
import { AttachmentError, useAttachmentUpload } from './AttachmentUploadContext';
import FileUploadReadMore from './FileUploadReadMore';
import { useAttachmentStyles } from './styles';

interface Props {
  label: string;
  attachmentValues?: AttachmentSettingValues | ComponentValue[];
  componentId: string;
  type?: Exclude<AttachmentType, 'other'>;
  description?: ReactNode;
  submissionAttachment?: SubmissionAttachment;
  onValueChange: (value?: Partial<SubmissionAttachmentValue>) => void;
  error?: AttachmentError;
  className?: string;
  refs?: MutableRefObject<Record<string, HTMLInputElement | HTMLFieldSetElement | HTMLButtonElement | null>>;
}

const AttachmentUpload = ({
  label,
  attachmentValues,
  componentId,
  type = 'default',
  description,
  submissionAttachment,
  onValueChange,
  error,
  className,
  refs,
}: Props) => {
  const styles = useAttachmentStyles();
  const { translate } = useLanguages();
  const { handleDeleteAllFilesForAttachment } = useAttachmentUpload();
  const { form } = useForm();

  const uploadedAttachmentFiles = submissionAttachment?.files ?? [];
  const options = attachmentUtils.mapKeysToOptions(attachmentValues, translate);
  const uploadSelected = !!options.find((option) => option.value === submissionAttachment?.value)?.upload;

  const handleDeleteAllFiles = async (attachmentId: string) => {
    await handleDeleteAllFilesForAttachment(attachmentId);
  };

  return (
    <VStack gap="space-24" className={clsx('mb', className)}>
      {uploadedAttachmentFiles.length > 0 ? (
        <div>
          <Label>{label}</Label>
          <BodyShort>{description}</BodyShort>
        </div>
      ) : (
        <AttachmentOptionSelect
          title={label}
          description={description}
          error={error?.message}
          value={
            submissionAttachment?.value
              ? {
                  key: submissionAttachment.value,
                  additionalDocumentation: submissionAttachment?.additionalDocumentation,
                }
              : undefined
          }
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
        <VStack gap="space-8">
          {uploadedAttachmentFiles.length > 0 && (
            <div className={styles.uploadedFilesHeader}>
              <Label>{translate(TEXTS.statiske.attachment.filesUploadedNotSent)}</Label>
              {uploadedAttachmentFiles.length > 1 && (
                <Button
                  variant="tertiary"
                  onClick={() => handleDeleteAllFiles(componentId)}
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
            readMore={<FileUploadReadMore />}
          />
        </VStack>
      )}
    </VStack>
  );
};

export default AttachmentUpload;
