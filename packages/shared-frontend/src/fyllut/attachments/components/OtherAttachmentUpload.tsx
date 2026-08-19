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
import { MutableRefObject, ReactNode, useState } from 'react';
import { useFormDefinition } from '../../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../../context/language/LanguageContext';
import { useSubmissionMethod } from '../../../context/submission-method/SubmissionMethodContext';
import { useAttachmentUpload } from '../context/AttachmentUploadContext';
import {
  filterAttachmentsByNavId,
  getDefaultOtherAttachment,
  getLargestAttachmentIdCounter,
} from '../context/attachmentUploadUtils';
import AttachmentOptionSelect from './AttachmentOptionSelect';
import FileUploader from './FileUploader';
import FileUploadReadMore from './FileUploadReadMore';
import useAttachmentValidation from './useAttachmentValidation';

const setOtherAttachmentRef = (
  refs: OtherAttachmentUploadFieldProps['refs'] | OtherAttachmentUploadProps['refs'],
  key: string,
  value: HTMLInputElement | HTMLFieldSetElement | HTMLButtonElement | null,
) => {
  if (refs?.current) {
    Reflect.set(refs.current, key, value);
  }
};

interface OtherAttachmentUploadFieldProps {
  label: string;
  required: boolean;
  attachmentValues?: AttachmentSettingValues | ComponentValue[];
  attachmentNavId: string;
  description?: ReactNode;
  submissionAttachment?: SubmissionAttachment;
  onValueChange: (value?: Partial<SubmissionAttachmentValue>) => void;
  error?: string;
  refs?: MutableRefObject<Record<string, HTMLInputElement | HTMLFieldSetElement | HTMLButtonElement | null>>;
  onUpload?: (attachment: SubmissionAttachment) => void;
}

const OtherAttachmentUploadField = ({
  label,
  required,
  attachmentValues,
  attachmentNavId,
  description,
  submissionAttachment,
  onValueChange,
  error,
  refs,
  onUpload,
}: OtherAttachmentUploadFieldProps) => {
  const { submissionMethod } = useSubmissionMethod();
  const { translate } = useLanguage();
  const { submissionAttachments, handleDeleteAttachment } = useAttachmentUpload();
  const { form } = useFormDefinition();
  const defaultAttachmentValues: Pick<SubmissionAttachment, 'navId' | 'type'> = {
    navId: attachmentNavId,
    type: 'other',
  };
  const [attachments, setAttachments] = useState(
    submissionAttachment
      ? filterAttachmentsByNavId(submissionAttachments, attachmentNavId)
      : [getDefaultOtherAttachment(attachmentNavId)],
  );
  const [attachmentCounter, setAttachmentCounter] = useState(getLargestAttachmentIdCounter(attachments));

  const uploadedAttachmentFiles = submissionAttachment?.files ?? [];
  const options = attachmentUtils.mapKeysToOptions(attachmentValues, translate, submissionMethod);
  const uploadOnlyMode = attachmentUtils.isSingleUploadOnlyOption(attachmentValues, submissionMethod);
  const uploadSelected =
    uploadOnlyMode || !!options.find((option) => option.value === submissionAttachment?.value)?.upload;

  const handleDelete = async (attachmentId: string) => {
    try {
      const currentAttachment = submissionAttachments.find((attachment) => attachment.attachmentId === attachmentId);
      if ((currentAttachment?.files ?? []).length > 0) {
        await handleDeleteAttachment(attachmentId);
      }
      setAttachments((current) => {
        if (current.length === 1) {
          const [{ value }] = current;
          return [getDefaultOtherAttachment(attachmentNavId, value)];
        }
        return current.filter((attachment) => attachment.attachmentId !== attachmentId);
      });
    } catch (_error) {
      // handled by upload context
    }
  };

  const handleUploadAnotherAttachment = () => {
    setAttachments((current) => [
      ...current,
      { attachmentId: `${attachmentNavId}-${attachmentCounter + 1}`, ...defaultAttachmentValues },
    ]);
    setAttachmentCounter((value) => value + 1);
  };

  const showAddAnotherButton = () =>
    attachments.every((otherAttachment) => {
      const fromSubmission = submissionAttachments.find(
        (submissionEntry) => otherAttachment.attachmentId === submissionEntry.attachmentId,
      );
      return (fromSubmission?.files ?? []).length > 0;
    });

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
          value={submissionAttachment?.value ? { key: submissionAttachment.value } : undefined}
          attachmentValues={attachmentValues}
          attachmentNavId={attachmentNavId}
          onChange={onValueChange}
          translate={translate}
          deadline={form.properties?.ettersendelsesfrist}
          submissionMethod={submissionMethod}
          ref={(ref) => setOtherAttachmentRef(refs, `${attachmentNavId}-VALUE`, ref)}
        />
      )}
      {uploadSelected && (
        <VStack gap="space-8">
          {uploadedAttachmentFiles.length > 0 && (
            <div>
              <Label>{translate(TEXTS.statiske.attachment.filesUploadedNotSent)}</Label>
            </div>
          )}
          <VStack gap="space-32">
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
                onUpload={onUpload}
              />
            ))}
            {showAddAnotherButton() && (
              <Button
                variant="tertiary"
                onClick={handleUploadAnotherAttachment}
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

interface OtherAttachmentUploadProps {
  label: string;
  required: boolean;
  attachmentValues?: AttachmentSettingValues | ComponentValue[];
  attachmentNavId: string;
  description?: ReactNode;
  refs?: MutableRefObject<Record<string, HTMLInputElement | HTMLFieldSetElement | HTMLButtonElement | null>>;
  onUpload?: (attachment: SubmissionAttachment) => void;
}

const OtherAttachmentUpload = ({
  label,
  required,
  attachmentValues,
  attachmentNavId,
  description,
  refs,
  onUpload,
}: OtherAttachmentUploadProps) => {
  const { submissionAttachments, changeAttachmentValue } = useAttachmentUpload();
  const { getAttachmentError } = useAttachmentValidation(submissionAttachments);
  const submissionAttachment = submissionAttachments.find((attachment) => attachment.navId === attachmentNavId);
  const attachmentError = getAttachmentError(attachmentNavId, 'value');

  const handleValueChange = (value: Partial<SubmissionAttachmentValue> | undefined) => {
    changeAttachmentValue(
      submissionAttachment ?? { attachmentId: attachmentNavId, navId: attachmentNavId, type: 'other' },
      value ? { value: value.key, additionalDocumentation: value.additionalDocumentation } : {},
    );
  };

  return (
    <OtherAttachmentUploadField
      label={label}
      required={required}
      description={description}
      attachmentValues={attachmentValues}
      attachmentNavId={attachmentNavId}
      submissionAttachment={submissionAttachment}
      onValueChange={handleValueChange}
      error={attachmentError}
      refs={refs}
      onUpload={onUpload}
    />
  );
};

export default OtherAttachmentUpload;
export type { OtherAttachmentUploadProps };
