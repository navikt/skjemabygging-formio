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
import { ReactNode } from 'react';
import {
  useFormDefinitionForm,
  useFormDefinitionSubmissionMethod,
} from '../../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../../context/language/LanguageContext';
import { useAttachmentUpload } from '../context/AttachmentUploadContext';
import AttachmentOptionSelect from './AttachmentOptionSelect';
import FileUploader from './FileUploader';
import FileUploadReadMore from './FileUploadReadMore';

interface Props {
  label: string;
  required: boolean;
  attachmentValues?: AttachmentSettingValues | ComponentValue[];
  attachmentNavId: string;
  attachmentId: string;
  submissionPath: string;
  type?: Exclude<AttachmentType, 'other'>;
  description?: ReactNode;
  submissionAttachment?: SubmissionAttachment;
  onValueChange: (value?: Partial<SubmissionAttachmentValue>) => void;
  error?: string;
  onUpload?: (attachment: SubmissionAttachment) => void;
}

const AttachmentUploadField = ({
  label,
  required,
  attachmentValues,
  attachmentNavId,
  attachmentId,
  submissionPath,
  type = 'default',
  description,
  submissionAttachment,
  onValueChange,
  error,
  onUpload,
}: Props) => {
  const submissionMethod = useFormDefinitionSubmissionMethod();
  const { translate } = useLanguage();
  const { handleDeleteAllFilesForAttachment } = useAttachmentUpload();
  const form = useFormDefinitionForm();

  const uploadedAttachmentFiles = submissionAttachment?.files ?? [];
  const options = attachmentUtils.mapKeysToOptions(attachmentValues, translate, submissionMethod);
  const uploadOnlyMode = attachmentUtils.isSingleUploadOnlyOption(attachmentValues, submissionMethod);
  const uploadSelected =
    uploadOnlyMode || !!options.find((option) => option.value === submissionAttachment?.value)?.upload;

  return (
    <VStack gap="space-24" data-cy="attachment-upload">
      {uploadedAttachmentFiles.length > 0 ? (
        <div>
          <Label>{label}</Label>
          {description && <BodyShort>{description}</BodyShort>}
        </div>
      ) : (
        <AttachmentOptionSelect
          title={label}
          required={required}
          description={description}
          error={error}
          value={
            submissionAttachment?.value
              ? {
                  key: submissionAttachment.value,
                  additionalDocumentation: submissionAttachment.additionalDocumentation,
                }
              : undefined
          }
          attachmentValues={attachmentValues}
          attachmentId={attachmentId}
          onChange={onValueChange}
          translate={translate}
          deadline={form.properties?.ettersendelsesfrist}
          submissionMethod={submissionMethod}
          submissionPath={submissionPath}
        />
      )}
      {uploadSelected && (
        <VStack gap="space-8">
          {uploadedAttachmentFiles.length > 0 && (
            <div>
              <Label>{translate(TEXTS.statiske.attachment.filesUploadedNotSent)}</Label>
              {uploadedAttachmentFiles.length > 1 && (
                <Button
                  variant="tertiary"
                  onClick={() =>
                    handleDeleteAllFilesForAttachment(
                      submissionAttachment?.attachmentId ?? attachmentNavId,
                      submissionPath,
                    )
                  }
                >
                  {translate(TEXTS.statiske.attachment.deleteAllFiles)}
                </Button>
              )}
            </div>
          )}
          <FileUploader
            attachmentLabel={label}
            initialAttachment={{
              attachmentId,
              navId: attachmentNavId,
              type,
            }}
            submissionPath={submissionPath}
            multiple
            readMore={<FileUploadReadMore />}
            onUpload={onUpload}
          />
        </VStack>
      )}
    </VStack>
  );
};

export default AttachmentUploadField;
export type { Props as AttachmentUploadFieldProps };
