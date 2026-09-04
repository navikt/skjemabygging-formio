import { SubmissionAttachment } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useEffect } from 'react';
import { attachmentValidationPath, useValidation } from '../../../context/validation/ValidationContext';
import { useOptionalValidationScope } from '../../../context/validation/ValidationScopeContext';

const useAttachmentValidation = (submissionAttachments: SubmissionAttachment[]) => {
  const { getError, getAttachmentExternalError, syncPageValidationState } = useValidation();
  const scope = useOptionalValidationScope();

  useEffect(() => {
    if (scope) {
      syncPageValidationState(scope.pageKey, scope.components);
    }
  }, [scope, submissionAttachments, syncPageValidationState]);

  const getAttachmentError = useCallback(
    (attachmentId: string, field: 'value' | 'files' | 'title') =>
      scope ? getError(attachmentValidationPath(attachmentId, field), scope.pageKey, scope.components) : undefined,
    [getError, scope],
  );

  return { getAttachmentError, getAttachmentExternalError };
};

export default useAttachmentValidation;
