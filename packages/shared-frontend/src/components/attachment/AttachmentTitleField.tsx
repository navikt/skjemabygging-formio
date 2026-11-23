import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguage } from '../../context/language/LanguageContext';
import { useValidationExternalError, useValidationFieldError } from '../../context/validation/ValidationContext';
import { UnvalidatedFields, useOptionalValidationScope } from '../../context/validation/ValidationScopeContext';
import TextField from '../text-field/TextField';
import { attachmentFieldPath } from './attachmentFieldPath';

interface Props {
  attachmentId: string;
  title?: string;
  submissionPath?: string;
  readOnly?: boolean;
  onChange: (title: string) => void;
}

const AttachmentTitleField = ({ attachmentId, title, submissionPath, readOnly, onChange }: Props) => {
  const { translate } = useLanguage();
  const pageKey = useOptionalValidationScope()?.pageKey;
  const attachmentTitlePath = attachmentFieldPath(submissionPath, attachmentId, 'title');
  const titleValidationError = useValidationFieldError(attachmentTitlePath, pageKey);
  const titleExternalError = useValidationExternalError(attachmentTitlePath);
  const attachmentTitleErrorMessage = titleValidationError ?? titleExternalError;

  return (
    <UnvalidatedFields>
      <TextField
        marginBottom="space-0"
        statePath={attachmentTitlePath}
        label={translate(TEXTS.statiske.attachment.attachmentTitle)}
        maxLength={50}
        value={title ?? ''}
        error={attachmentTitleErrorMessage}
        onChange={onChange}
        readOnly={readOnly}
      />
    </UnvalidatedFields>
  );
};

export default AttachmentTitleField;
