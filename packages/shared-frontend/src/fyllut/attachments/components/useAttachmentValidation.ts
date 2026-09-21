import { SubmissionAttachment } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useEffect } from 'react';
import { useValidationActions, useValidationErrorAccess } from '../../../context/validation/ValidationContext';
import { useOptionalValidationScope } from '../../../context/validation/ValidationScopeContext';
import { AttachmentField, attachmentFieldPath } from '../attachmentFieldPath';

const useAttachmentValidation = (submissionPath: string | undefined, submissionAttachments: SubmissionAttachment[]) => {
  const { getError, getExternalError } = useValidationErrorAccess();
  const { schedulePageValidation } = useValidationActions();
  const scope = useOptionalValidationScope();

  useEffect(() => {
    if (scope) {
      schedulePageValidation(scope.pageKey);
    }
  }, [schedulePageValidation, scope, submissionAttachments]);

  const getAttachmentError = useCallback(
    (attachmentId: string, field: AttachmentField) => {
      const statePath = attachmentFieldPath(submissionPath, attachmentId, field);
      return (scope ? getError(statePath, scope.pageKey) : undefined) ?? getExternalError(statePath);
    },
    [getError, getExternalError, scope, submissionPath],
  );

  return { getAttachmentError };
};

export default useAttachmentValidation;
