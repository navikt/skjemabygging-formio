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
import { ReactNode, useRef } from 'react';
import { createAttachmentId, getAttachmentsAtPath } from '../../../context/attachment/attachmentData';
import {
  useFormDefinitionForm,
  useFormDefinitionSubmissionMethod,
} from '../../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../../context/language/LanguageContext';
import { useSubmissionState } from '../../../context/state/SubmissionStateContext';
import ValidationRegistration from '../../../context/validation/ValidationRegistration';
import { attachmentFieldPath } from '../attachmentFieldPath';
import { attachmentValueRules } from '../attachmentUploadValidation';
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

interface OtherAttachmentUploadFieldProps {
  label: string;
  required: boolean;
  attachmentValues?: AttachmentSettingValues | ComponentValue[];
  attachmentNavId: string;
  submissionPath: string;
  description?: ReactNode;
  submissionAttachment?: SubmissionAttachment;
  onValueChange: (value?: Partial<SubmissionAttachmentValue>) => void;
  error?: string;
  onUpload?: (attachment: SubmissionAttachment) => void;
}

const OtherAttachmentUploadField = ({
  label,
  required,
  attachmentValues,
  attachmentNavId,
  submissionPath,
  description,
  submissionAttachment,
  onValueChange,
  error,
  onUpload,
}: OtherAttachmentUploadFieldProps) => {
  const submissionMethod = useFormDefinitionSubmissionMethod();
  const { translate } = useLanguage();
  const { submission } = useSubmissionState();
  const { changeAttachmentValue, handleDeleteAttachment } = useAttachmentUpload();
  const submissionAttachments = getAttachmentsAtPath(submission, submissionPath);
  const form = useFormDefinitionForm();
  const baseAttachmentId = createAttachmentId(attachmentNavId, submissionPath);
  const storedAttachments = filterAttachmentsByNavId(submissionAttachments, attachmentNavId);
  const attachments =
    storedAttachments.length > 0
      ? storedAttachments
      : [{ ...getDefaultOtherAttachment(attachmentNavId), attachmentId: baseAttachmentId }];
  const attachmentCounter = useRef(getLargestAttachmentIdCounter(attachments));

  const uploadedAttachmentFiles = submissionAttachment?.files ?? [];
  const options = attachmentUtils.mapKeysToOptions(attachmentValues, translate, submissionMethod);
  const uploadOnlyMode = attachmentUtils.isSingleUploadOnlyOption(attachmentValues, submissionMethod);
  const uploadSelected =
    uploadOnlyMode || !!options.find((option) => option.value === submissionAttachment?.value)?.upload;

  const handleDelete = async (attachmentId: string) => {
    try {
      await handleDeleteAttachment(attachmentId, submissionPath, true);
    } catch (_error) {
      // The upload context displays the failure.
    }
  };

  const handleUploadAnotherAttachment = () => {
    attachmentCounter.current += 1;
    changeAttachmentValue(
      {
        attachmentId: `${baseAttachmentId}-${attachmentCounter.current}`,
        navId: attachmentNavId,
        type: 'other',
      },
      {},
      submissionPath,
      true,
    );
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
          attachmentId={baseAttachmentId}
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
            </div>
          )}
          <VStack gap="space-32">
            {attachments.map((attachment) => (
              <FileUploader
                key={attachment.attachmentId}
                attachmentLabel={label}
                initialAttachment={attachment}
                submissionPath={submissionPath}
                multipleAttachments
                requireAttachmentTitle
                attachmentValue={submissionAttachment?.value}
                showDeleteAttachmentButton={attachments.length > 1}
                onDeleteAttachment={handleDelete}
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
  submissionPath: string;
  description?: ReactNode;
  onUpload?: (attachment: SubmissionAttachment) => void;
}

const OtherAttachmentUpload = ({
  label,
  required,
  attachmentValues,
  attachmentNavId,
  submissionPath,
  description,
  onUpload,
}: OtherAttachmentUploadProps) => {
  const { submission } = useSubmissionState();
  const { changeAttachmentValue } = useAttachmentUpload();
  const submissionAttachments = getAttachmentsAtPath(submission, submissionPath);
  const { getAttachmentError } = useAttachmentValidation(submissionPath, submissionAttachments);
  const submissionAttachment = submissionAttachments.find((attachment) => attachment.navId === attachmentNavId);
  const attachmentId = createAttachmentId(attachmentNavId, submissionPath);
  const attachmentError = getAttachmentError(attachmentId, 'value');

  const handleValueChange = (value: Partial<SubmissionAttachmentValue> | undefined) => {
    const storedAttachments = filterAttachmentsByNavId(submissionAttachments, attachmentNavId);
    const attachmentsToUpdate =
      storedAttachments.length > 0
        ? storedAttachments
        : [{ attachmentId, navId: attachmentNavId, type: 'other' as const }];
    attachmentsToUpdate.forEach((attachment) =>
      changeAttachmentValue(
        attachment,
        value ? { value: value.key, additionalDocumentation: value.additionalDocumentation } : {},
        submissionPath,
        true,
      ),
    );
  };

  return (
    <>
      <ValidationRegistration
        label={label}
        statePath={attachmentFieldPath(submissionPath, attachmentId, 'value')}
        value={submissionAttachment?.value}
        rules={attachmentValueRules(required)}
      />
      <OtherAttachmentUploadField
        label={label}
        required={required}
        description={description}
        attachmentValues={attachmentValues}
        attachmentNavId={attachmentNavId}
        submissionPath={submissionPath}
        submissionAttachment={submissionAttachment}
        onValueChange={handleValueChange}
        error={attachmentError}
        onUpload={onUpload}
      />
    </>
  );
};

export default OtherAttachmentUpload;
export type { OtherAttachmentUploadProps };
