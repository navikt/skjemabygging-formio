import { Form, SENDINN_ATTACHMENTS_KEY, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode, useCallback } from 'react';
import { useLanguage } from '../../context/language/LanguageContext';
import FormValidationProvider from '../../form-components/page-validation/FormValidationProvider';
import { collectSendinnAttachmentValidationFields } from './sendinnAttachmentValidation';

const SendinnValidationProvider = ({ children }: { children: ReactNode }) => {
  const { currentLanguage } = useLanguage();
  const resolveSpecialPageFields = useCallback(
    (pageKey: string, submission: Submission | undefined, form: Form) =>
      pageKey === SENDINN_ATTACHMENTS_KEY
        ? collectSendinnAttachmentValidationFields({ form, submission, currentLanguage })
        : undefined,
    [currentLanguage],
  );
  return (
    <FormValidationProvider resolveSpecialPageFields={resolveSpecialPageFields}>{children}</FormValidationProvider>
  );
};

export default SendinnValidationProvider;
