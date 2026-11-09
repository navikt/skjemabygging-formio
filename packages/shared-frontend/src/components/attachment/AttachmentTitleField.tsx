import { SubmissionAttachment, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { createAttachmentSubmissionActions } from '../../context/attachment/attachmentSubmission';
import { useAttachmentUpload } from '../../context/attachment/AttachmentUploadContext';
import { useLanguage } from '../../context/language/LanguageContext';
import { useOptionalFieldStateStore } from '../../context/state/StateContext';
import { useValidationExternalError, useValidationFieldError } from '../../context/validation/ValidationContext';
import { UnvalidatedFields, useOptionalValidationScope } from '../../context/validation/ValidationScopeContext';
import TextField from '../text-field/TextField';
import { attachmentFieldPath } from './attachmentFieldPath';

interface Props {
  initialAttachment: SubmissionAttachment;
  title?: string;
  submissionPath?: string;
  multipleAttachments?: boolean;
  attachmentValue?: SubmissionAttachment['value'];
  readOnly?: boolean;
  withoutUpload?: boolean;
}

const AttachmentTitleField = ({
  initialAttachment,
  title,
  submissionPath,
  multipleAttachments = false,
  attachmentValue,
  readOnly,
  withoutUpload = false,
}: Props) => {
  const { translate } = useLanguage();
  const store = useOptionalFieldStateStore();
  const { changeAttachmentValue: changeUploadAttachmentValue } = useAttachmentUpload();
  // Hosts without upload capability, such as Sendinn, have no upload provider, so the title is written to the submission directly.
  const changeAttachmentValue =
    withoutUpload && store
      ? createAttachmentSubmissionActions(store).changeAttachmentValue
      : changeUploadAttachmentValue;
  const pageKey = useOptionalValidationScope()?.pageKey;
  const attachmentTitlePath = attachmentFieldPath(submissionPath, initialAttachment.attachmentId, 'title');
  const titleValidationError = useValidationFieldError(attachmentTitlePath, pageKey);
  const titleExternalError = useValidationExternalError(attachmentTitlePath);
  const attachmentTitleErrorMessage = titleValidationError ?? titleExternalError;
  const handleTitleChange = (nextTitle: string) => {
    changeAttachmentValue(
      initialAttachment,
      {
        value: attachmentValue,
        title: nextTitle,
      },
      submissionPath,
      multipleAttachments,
    );
  };

  return (
    <UnvalidatedFields>
      <TextField
        marginBottom="space-0"
        statePath={attachmentTitlePath}
        label={translate(TEXTS.statiske.attachment.attachmentTitle)}
        maxLength={50}
        value={title ?? ''}
        error={attachmentTitleErrorMessage}
        onChange={handleTitleChange}
        readOnly={readOnly}
      />
    </UnvalidatedFields>
  );
};

export default AttachmentTitleField;
