import { SubmissionAttachment } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useEffect } from 'react';
import {
  attachmentValidationPath,
  useValidationActions,
  useValidationErrorAccess,
} from '../../../context/validation/ValidationContext';
import { useOptionalValidationScope } from '../../../context/validation/ValidationScopeContext';

const useAttachmentValidation = (submissionAttachments: SubmissionAttachment[]) => {
  const { getError, getAttachmentExternalError } = useValidationErrorAccess();
  const { schedulePageValidation } = useValidationActions();
  const scope = useOptionalValidationScope();

  useEffect(() => {
    if (scope) {
      schedulePageValidation(scope.pageKey);
    }
  }, [schedulePageValidation, scope, submissionAttachments]);

  const getAttachmentError = useCallback(
    (attachmentId: string, field: 'value' | 'files' | 'title') =>
      scope ? getError(attachmentValidationPath(attachmentId, field), scope.pageKey) : undefined,
    [getError, scope],
  );

  return { getAttachmentError, getAttachmentExternalError };
};

export default useAttachmentValidation;
