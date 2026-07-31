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
import { useFyllutAppConfig } from '../../context/fyllut/FyllutAppConfigContext';
import { useFyllutLanguage } from '../../context/fyllut/FyllutLanguageContext';
import { useFormDefinition } from '../framework';
import AttachmentOptionSelect from '../fyllut-components/AttachmentOptionSelect';
import { AttachmentError, useAttachmentUpload } from './AttachmentUploadContext';
import {
  filterAttachmentsByComponentId,
  getDefaultOtherAttachment,
  getLargestAttachmentIdCounter,
} from './attachmentUploadUtils';
import FileUploader from './FileUploader';
import FileUploadReadMore from './FileUploadReadMore';

const setOtherAttachmentRef = (
  refs: Props['refs'] | SharedOtherAttachmentUploadFieldProps['refs'],
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
  description?: ReactNode;
  submissionAttachment?: SubmissionAttachment;
  onValueChange: (value?: Partial<SubmissionAttachmentValue>) => void;
  error?: AttachmentError;
  refs?: MutableRefObject<Record<string, HTMLInputElement | HTMLFieldSetElement | HTMLButtonElement | null>>;
}

const OtherAttachmentUploadField = ({
  label,
  attachmentValues,
  componentId,
  description,
  submissionAttachment,
  onValueChange,
  error,
  refs,
}: Props) => {
  const { submissionMethod } = useFyllutAppConfig();
  const { translate } = useFyllutLanguage();
  const { submissionAttachments, handleDeleteAttachment } = useAttachmentUpload();
  const { form } = useFormDefinition();
  const defaultAttachmentValues: Pick<SubmissionAttachment, 'navId' | 'type'> = { navId: componentId, type: 'other' };
  const [attachments, setAttachments] = useState(
    submissionAttachment
      ? filterAttachmentsByComponentId(submissionAttachments, componentId)
      : [getDefaultOtherAttachment(componentId)],
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
          return [getDefaultOtherAttachment(componentId, value)];
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
      { attachmentId: `${componentId}-${attachmentCounter + 1}`, ...defaultAttachmentValues },
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
          description={description}
          error={error?.message}
          value={submissionAttachment?.value ? { key: submissionAttachment.value } : undefined}
          attachmentValues={attachmentValues}
          onChange={onValueChange}
          translate={translate}
          deadline={form.properties?.ettersendelsesfrist}
          submissionMethod={submissionMethod}
          ref={(ref) => setOtherAttachmentRef(refs, `${componentId}-VALUE`, ref)}
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

interface SharedOtherAttachmentUploadFieldProps {
  label: string;
  attachmentValues?: AttachmentSettingValues | ComponentValue[];
  componentId: string;
  description?: ReactNode;
  refs?: MutableRefObject<Record<string, HTMLInputElement | HTMLFieldSetElement | HTMLButtonElement | null>>;
}

const SharedOtherAttachmentUploadField = ({
  label,
  attachmentValues,
  componentId,
  description,
  refs,
}: SharedOtherAttachmentUploadFieldProps) => {
  const { submissionAttachments, errors, changeAttachmentValue } = useAttachmentUpload();
  const submissionAttachment = submissionAttachments.find((attachment) =>
    attachment.attachmentId.startsWith(componentId),
  );
  const attachmentError = errors[componentId]?.find((currentError) => currentError.type === 'VALUE');

  const handleValueChange = (value: Partial<SubmissionAttachmentValue> | undefined) => {
    changeAttachmentValue(
      submissionAttachment ?? { attachmentId: componentId, navId: componentId, type: 'other' },
      value ? { value: value.key, additionalDocumentation: value.additionalDocumentation } : {},
    );
  };

  return (
    <OtherAttachmentUploadField
      label={label}
      description={description}
      attachmentValues={attachmentValues}
      componentId={componentId}
      submissionAttachment={submissionAttachment}
      onValueChange={handleValueChange}
      error={attachmentError}
      refs={refs}
    />
  );
};

export default SharedOtherAttachmentUploadField;
