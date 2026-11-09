import { SubmissionAttachment, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useAttachmentUpload } from '../../context/attachment/AttachmentUploadContext';
import { useLanguage } from '../../context/language/LanguageContext';
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
}

const AttachmentTitleField = ({
  initialAttachment,
  title,
  submissionPath,
  multipleAttachments = false,
  attachmentValue,
  readOnly,
}: Props) => {
  const { translate } = useLanguage();
  const { changeAttachmentValue } = useAttachmentUpload();
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
