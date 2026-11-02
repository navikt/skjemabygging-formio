import { Submission, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode } from 'react';
import {
  toAttachmentFilesValidationFields,
  toAttachmentValueValidationFields,
} from '../../components/attachment/attachmentValidation';
import FormValidationProvider from '../../form-components/page-validation/FormValidationProvider';

const resolveSpecialPageFields = (pageKey: string, submission?: Submission) => {
  if (pageKey !== 'personal-id') return undefined;
  const input = {
    attachmentId: 'personal-id',
    label: TEXTS.statiske.uploadId.label,
    required: true,
    attachment: submission?.attachments?.find((item) => item.attachmentId === 'personal-id'),
    requiredFilesMessage: TEXTS.statiske.uploadId.missingUploadError,
  };
  return [...toAttachmentValueValidationFields(input), ...toAttachmentFilesValidationFields(input)];
};

const FyllutValidationProvider = ({
  children,
  initialPagesWithErrors,
}: {
  children: ReactNode;
  initialPagesWithErrors?: string[];
}) => (
  <FormValidationProvider
    initialPagesWithErrors={initialPagesWithErrors}
    resolveSpecialPageFields={resolveSpecialPageFields}
  >
    {children}
  </FormValidationProvider>
);

export default FyllutValidationProvider;
