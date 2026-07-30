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
import { useFyllutAppConfig } from '../../context/fyllut/FyllutAppConfigContext';
import { useFyllutLanguage } from '../../context/fyllut/FyllutLanguageContext';
import { useFormDefinition } from '../framework';
import AttachmentOptionSelect from '../fyllut-components/AttachmentOptionSelect';
import { AttachmentError, useAttachmentUpload } from './AttachmentUploadContext';
import { attachmentValidator } from './attachmentValidation';
import FileUploader from './FileUploader';
import FileUploadReadMore from './FileUploadReadMore';

const setAttachmentRef = (
  refs: Props['refs'] | SharedAttachmentUploadFieldProps['refs'],
  key: string,
  value: HTMLInputElement | HTMLFieldSetElement | HTMLButtonElement | null,
) => {
  if (refs?.current) {
    Reflect.set(refs.current, key, value);
  }
};

interface Props {
  label: string;
  attachmentValues?: AttachmentSettingValues | ComponentValue[];
  componentId: string;
  type?: Exclude<AttachmentType, 'other'>;
  description?: ReactNode;
  submissionAttachment?: SubmissionAttachment;
  onValueChange: (value?: Partial<SubmissionAttachmentValue>) => void;
  error?: AttachmentError;
  refs?: MutableRefObject<Record<string, HTMLInputElement | HTMLFieldSetElement | HTMLButtonElement | null>>;
}

const AttachmentUploadField = ({
  label,
  attachmentValues,
  componentId,
  type = 'default',
  description,
  submissionAttachment,
  onValueChange,
  error,
  refs,
}: Props) => {
  const { submissionMethod } = useFyllutAppConfig();
  const { translate } = useFyllutLanguage();
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
          description={description}
          error={error?.message}
          value={
            submissionAttachment?.value
              ? {
                  key: submissionAttachment.value,
                  additionalDocumentation: submissionAttachment.additionalDocumentation,
                }
              : undefined
          }
          attachmentValues={attachmentValues}
          onChange={onValueChange}
          translate={translate}
          deadline={form.properties?.ettersendelsesfrist}
          submissionMethod={submissionMethod}
          ref={(ref) => setAttachmentRef(refs, `${componentId}-VALUE`, ref)}
        />
      )}
      {uploadSelected && (
        <VStack gap="space-8">
          {uploadedAttachmentFiles.length > 0 && (
            <div>
              <Label>{translate(TEXTS.statiske.attachment.filesUploadedNotSent)}</Label>
              {uploadedAttachmentFiles.length > 1 && (
                <Button variant="tertiary" onClick={() => handleDeleteAllFilesForAttachment(componentId)}>
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

interface SharedAttachmentUploadFieldProps {
  label: string;
  attachmentValues?: AttachmentSettingValues | ComponentValue[];
  componentId: string;
  description?: ReactNode;
  type?: AttachmentType;
  refs?: MutableRefObject<Record<string, HTMLInputElement | HTMLFieldSetElement | HTMLButtonElement | null>>;
}

const SharedAttachmentUploadField = ({
  label,
  attachmentValues,
  componentId,
  description,
  type = 'default',
  refs,
}: SharedAttachmentUploadFieldProps) => {
  const { submissionAttachments, errors, changeAttachmentValue } = useAttachmentUpload();
  const { translate } = useFyllutLanguage();

  const submissionAttachment = submissionAttachments.find((attachment) =>
    attachment.attachmentId.startsWith(componentId),
  );
  const validator = attachmentValidator(translate, ['value']);
  const attachmentError = errors[componentId]?.find((currentError) => currentError.type === 'VALUE');

  const handleValueChange = (value: Partial<SubmissionAttachmentValue> | undefined) => {
    changeAttachmentValue(
      submissionAttachment ?? { attachmentId: componentId, navId: componentId, type },
      value ? { value: value.key, additionalDocumentation: value.additionalDocumentation } : {},
      validator,
    );
  };

  return (
    <AttachmentUploadField
      label={label}
      description={description}
      attachmentValues={attachmentValues}
      componentId={componentId}
      type={type as Exclude<AttachmentType, 'other'>}
      submissionAttachment={submissionAttachment}
      onValueChange={handleValueChange}
      error={attachmentError}
      refs={refs}
    />
  );
};

export default SharedAttachmentUploadField;
