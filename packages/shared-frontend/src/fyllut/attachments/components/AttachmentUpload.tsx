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
import { MutableRefObject, ReactNode } from 'react';
import { useFormDefinition } from '../../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../../context/language/LanguageContext';
import { useSubmissionMethod } from '../../../context/submission-method/SubmissionMethodContext';
import { useAttachmentUpload } from '../context/AttachmentUploadContext';
import AttachmentOptionSelect from './AttachmentOptionSelect';
import FileUploader from './FileUploader';
import FileUploadReadMore from './FileUploadReadMore';
import useAttachmentValidation from './useAttachmentValidation';

const setAttachmentRef = (
  refs: AttachmentUploadFieldProps['refs'] | AttachmentUploadProps['refs'],
  key: string,
  value: HTMLInputElement | HTMLFieldSetElement | HTMLButtonElement | null,
) => {
  if (refs?.current) {
    Reflect.set(refs.current, key, value);
  }
};

interface AttachmentUploadFieldProps {
  label: string;
  required: boolean;
  attachmentValues?: AttachmentSettingValues | ComponentValue[];
  attachmentNavId: string;
  type?: Exclude<AttachmentType, 'other'>;
  description?: ReactNode;
  submissionAttachment?: SubmissionAttachment;
  onValueChange: (value?: Partial<SubmissionAttachmentValue>) => void;
  error?: string;
  refs?: MutableRefObject<Record<string, HTMLInputElement | HTMLFieldSetElement | HTMLButtonElement | null>>;
  onUpload?: (attachment: SubmissionAttachment) => void;
}

const AttachmentUploadField = ({
  label,
  required,
  attachmentValues,
  attachmentNavId,
  type = 'default',
  description,
  submissionAttachment,
  onValueChange,
  error,
  refs,
  onUpload,
}: AttachmentUploadFieldProps) => {
  const { submissionMethod } = useSubmissionMethod();
  const { translate } = useLanguage();
  const { handleDeleteAllFilesForAttachment } = useAttachmentUpload();
  const { form } = useFormDefinition();

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
          attachmentNavId={attachmentNavId}
          onChange={onValueChange}
          translate={translate}
          deadline={form.properties?.ettersendelsesfrist}
          submissionMethod={submissionMethod}
          ref={(ref) => setAttachmentRef(refs, `${attachmentNavId}-VALUE`, ref)}
        />
      )}
      {uploadSelected && (
        <VStack gap="space-8">
          {uploadedAttachmentFiles.length > 0 && (
            <div>
              <Label>{translate(TEXTS.statiske.attachment.filesUploadedNotSent)}</Label>
              {uploadedAttachmentFiles.length > 1 && (
                <Button variant="tertiary" onClick={() => handleDeleteAllFilesForAttachment(attachmentNavId)}>
                  {translate(TEXTS.statiske.attachment.deleteAllFiles)}
                </Button>
              )}
            </div>
          )}
          <FileUploader
            initialAttachment={{ attachmentId: attachmentNavId, navId: attachmentNavId, type }}
            refs={refs}
            multiple
            readMore={<FileUploadReadMore />}
            onUpload={onUpload}
          />
        </VStack>
      )}
    </VStack>
  );
};

interface AttachmentUploadProps {
  label: string;
  required: boolean;
  attachmentValues?: AttachmentSettingValues | ComponentValue[];
  attachmentNavId: string;
  description?: ReactNode;
  type?: AttachmentType;
  refs?: MutableRefObject<Record<string, HTMLInputElement | HTMLFieldSetElement | HTMLButtonElement | null>>;
  onUpload?: (attachment: SubmissionAttachment) => void;
}

const AttachmentUpload = ({
  label,
  required,
  attachmentValues,
  attachmentNavId,
  description,
  type = 'default',
  refs,
  onUpload,
}: AttachmentUploadProps) => {
  const { submissionAttachments, changeAttachmentValue } = useAttachmentUpload();
  const { getAttachmentError } = useAttachmentValidation(submissionAttachments);

  const submissionAttachment = submissionAttachments.find((attachment) => attachment.navId === attachmentNavId);
  const attachmentError = getAttachmentError(attachmentNavId, 'value');

  const handleValueChange = (value: Partial<SubmissionAttachmentValue> | undefined) => {
    changeAttachmentValue(
      submissionAttachment ?? { attachmentId: attachmentNavId, navId: attachmentNavId, type },
      value ? { value: value.key, additionalDocumentation: value.additionalDocumentation } : {},
    );
  };

  return (
    <AttachmentUploadField
      label={label}
      required={required}
      description={description}
      attachmentValues={attachmentValues}
      attachmentNavId={attachmentNavId}
      type={type as Exclude<AttachmentType, 'other'>}
      submissionAttachment={submissionAttachment}
      onValueChange={handleValueChange}
      error={attachmentError}
      refs={refs}
      onUpload={onUpload}
    />
  );
};

export default AttachmentUpload;
export type { AttachmentUploadProps };
