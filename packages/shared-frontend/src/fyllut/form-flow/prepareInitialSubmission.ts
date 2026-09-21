import { Form, Submission, SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';
import { hydrateLegacyAttachments } from '../../context/attachment/attachmentData';
import { applyInitialValuesToSubmission } from '../../context/form-definition/initialSubmissionValues';
import { normalizeSubmissionData } from '../../context/form-definition/submissionNormalization';

const prepareInitialSubmission = (
  form: Form,
  submission: Submission | undefined,
  currentLanguage: string,
  submissionMethod: SubmissionMethod | undefined,
): Submission | undefined =>
  applyInitialValuesToSubmission(
    form,
    hydrateLegacyAttachments(form, normalizeSubmissionData(form, submission)),
    currentLanguage,
    { submissionMethod },
  );

export { prepareInitialSubmission };
