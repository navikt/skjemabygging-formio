import { PlusIcon } from '@navikt/aksel-icons';
import { BodyShort, Button, Label, VStack } from '@navikt/ds-react';
import { AttachmentType, SubmissionAttachment, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useRef } from 'react';
import { useAttachmentUpload } from '../../context/attachment/AttachmentUploadContext';
import { createAttachmentId } from '../../context/attachment/attachmentData';
import { readAttachments } from '../../context/attachment/attachmentSubmission';
import { getLargestAttachmentIdCounter } from '../../context/attachment/attachmentUploadUtils';
import { useLanguage } from '../../context/language/LanguageContext';
import { useOptionalFieldStateStore } from '../../context/state/StateContext';
import { useFieldBinding } from '../../context/state/useFieldBinding';
import { useValidationExternalError, useValidationFieldError } from '../../context/validation/ValidationContext';
import ValidationRegistration from '../../context/validation/ValidationRegistration';
import { useOptionalValidationScope } from '../../context/validation/ValidationScopeContext';
import { inputId } from '../../utils/inputId';
import Alert from '../alert/Alert';
import FileUploadReadMore from '../file-upload/FileUploadReadMore';
import ReadMore from '../read-more/ReadMore';
import FormElementBox from '../shared/FormElementBox';
import { BaseFieldProps, ChoiceValidation } from '../types';
import AttachmentItem from './AttachmentItem';
import AttachmentOptionSelect from './AttachmentOptionSelect';
import { attachmentFieldPath } from './attachmentFieldPath';
import { AttachmentChoice, AttachmentChoiceOption, getImplicitAttachmentValue } from './attachmentOptions';
import { toAttachmentValueValidationFields } from './attachmentValidation';

interface AttachmentProps extends BaseFieldProps {
  label: string;
  values: AttachmentChoiceOption[];
  attachmentNavId: string;
  type?: AttachmentType;
  uploadEnabled?: boolean;
  downloadEnabled?: boolean;
  deadlineDays?: string;
  validation?: ChoiceValidation;
}

const Attachment = ({
  statePath,
  label,
  description,
  required = true,
  readOnly,
  fieldSize,
  marginBottom,
  readMore,
  values,
  attachmentNavId,
  type = 'default',
  uploadEnabled = false,
  downloadEnabled = false,
  deadlineDays,
  validation,
}: AttachmentProps) => {
  const { translate } = useLanguage();
  const { stateValue, setStateValue } = useFieldBinding({ statePath });
  const store = useOptionalFieldStateStore();
  const { handleDeleteAttachment, handleDeleteAllFilesForAttachment, removeError } = useAttachmentUpload();
  const attachments = readAttachments(stateValue);
  const multiple = type === 'other';
  const baseId = attachments[0]?.attachmentId ?? createAttachmentId(attachmentNavId, statePath);
  const attachment = attachments[0];
  const attachmentId = attachment?.attachmentId ?? baseId;
  const implicitValue = getImplicitAttachmentValue(values, uploadEnabled);
  const value = attachment?.value ?? implicitValue;
  const uploadSelected = uploadEnabled && !!values.find((option) => option.value === value)?.upload;
  const counter = useRef(getLargestAttachmentIdCounter(attachments));
  const choicePath = attachmentFieldPath(statePath, attachmentId, 'value');
  const scope = useOptionalValidationScope();
  const pageKey = scope?.pageKey;
  const previousIds = useRef<string[]>([]);
  useEffect(() => {
    const currentIds = attachments.map((item) => item.attachmentId);
    previousIds.current.filter((id) => !currentIds.includes(id)).forEach((id) => removeError(id, statePath));
    previousIds.current = currentIds;
  }, [attachments, removeError, statePath]);
  useEffect(
    () => () => {
      if (scope?.active.current) previousIds.current.forEach((id) => removeError(id, statePath));
    },
    [removeError, scope, statePath],
  );
  const validationError = useValidationFieldError(choicePath, pageKey);
  const externalError = useValidationExternalError(choicePath);
  const fields = toAttachmentValueValidationFields({
    submissionPath: statePath,
    attachmentId,
    label,
    required,
    attachment: attachment ?? {
      attachmentId,
      navId: attachmentNavId,
      type,
      value,
    },
    validation,
  });
  const update = (transform: (current: SubmissionAttachment[]) => SubmissionAttachment[]) => {
    const next = transform(readAttachments(store?.getValue(statePath)));
    setStateValue(multiple ? next : next[0]);
  };
  const handleValueChange = (next?: AttachmentChoice) => {
    removeError(attachmentId, statePath);
    if (!next?.value) {
      setStateValue(undefined);
      return;
    }
    update((current) =>
      (current.length
        ? current
        : [
            {
              attachmentId: statePath.includes('[') ? `${attachmentId}-${crypto.randomUUID()}` : attachmentId,
              navId: attachmentNavId,
              type,
            },
          ]
      ).map((item) => ({
        ...item,
        value: next?.value,
        additionalDocumentation: next?.additionalDocumentation,
        ...(!uploadEnabled ? { files: [] } : {}),
      })),
    );
  };
  const uploadedFiles = attachments.flatMap((item) => item.files ?? []);
  const documents = attachments.length ? attachments : [{ attachmentId, navId: attachmentNavId, type, value }];
  const deleteDocument = async (id: string) => {
    try {
      await handleDeleteAttachment(id, statePath, multiple);
    } catch {
      /* Reported by the provider. */
    }
  };

  return (
    <FormElementBox fieldSize={fieldSize} marginBottom={marginBottom}>
      {fields.map((field) => (
        <ValidationRegistration
          key={field.statePath}
          label={field.field}
          statePath={field.statePath}
          value={field.value}
          rules={field.rules}
        />
      ))}
      <VStack gap="space-24" data-cy={uploadEnabled ? 'attachment-upload' : undefined}>
        {uploadEnabled && uploadedFiles.length > 0 ? (
          <div id={inputId(choicePath)} tabIndex={-1}>
            <Label>{translate(label)}</Label>
            {description && <BodyShort>{translate(description)}</BodyShort>}
            {(validationError ?? externalError) && (
              <Alert variant="error" inline>
                {validationError ?? externalError}
              </Alert>
            )}
          </div>
        ) : (
          <AttachmentOptionSelect
            title={translate(label)}
            required={required}
            description={translate(description)}
            error={validationError ?? externalError}
            value={attachment}
            values={values}
            attachmentId={attachmentId}
            onChange={handleValueChange}
            translate={translate}
            deadline={deadlineDays}
            uploadEnabled={uploadEnabled}
            submissionPath={statePath}
            readOnly={readOnly}
          />
        )}
        {uploadSelected && (
          <VStack gap="space-8">
            {uploadedFiles.length > 0 && (
              <div>
                <Label>{translate(TEXTS.statiske.attachment.filesUploadedNotSent)}</Label>
                {!multiple && uploadedFiles.length > 1 && !readOnly && (
                  <Button variant="tertiary" onClick={() => handleDeleteAllFilesForAttachment(attachmentId, statePath)}>
                    {translate(TEXTS.statiske.attachment.deleteAllFiles)}
                  </Button>
                )}
              </div>
            )}
            <VStack gap="space-32">
              {documents.map((item) => (
                <AttachmentItem
                  uploadSelected={uploadSelected}
                  key={item.attachmentId}
                  initialAttachment={item}
                  attachmentLabel={label}
                  submissionPath={statePath}
                  multipleAttachments={multiple}
                  multiple={!multiple}
                  requireAttachmentTitle={multiple}
                  attachmentValue={value}
                  showDeleteAttachmentButton={multiple && documents.length > 1}
                  onDeleteAttachment={multiple ? deleteDocument : undefined}
                  readMore={<FileUploadReadMore />}
                  readOnly={readOnly}
                  downloadEnabled={downloadEnabled}
                />
              ))}
              {multiple && !readOnly && documents.every((item) => !!item.files?.length) && (
                <Button
                  variant="tertiary"
                  icon={<PlusIcon aria-hidden fontSize="1.5rem" />}
                  onClick={() => {
                    update((current) => {
                      counter.current = Math.max(counter.current, getLargestAttachmentIdCounter(current)) + 1;
                      return [
                        ...current,
                        {
                          attachmentId: `${baseId}-${counter.current}`,
                          navId: attachmentNavId,
                          type,
                          value: current[0]?.value ?? value,
                          files: [],
                        },
                      ];
                    });
                  }}
                >
                  {translate(TEXTS.statiske.attachment.addNewAttachment)}
                </Button>
              )}
            </VStack>
          </VStack>
        )}
        {readMore && <ReadMore {...readMore} />}
      </VStack>
    </FormElementBox>
  );
};

export default Attachment;
export type { AttachmentProps };
