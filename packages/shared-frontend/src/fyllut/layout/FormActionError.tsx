import { Alert } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguage } from '../../context/language/LanguageContext';
import { useFormActions } from '../context/form-actions/FormActionsContext';

const hasUserMessage = (error: unknown): error is { userMessage: string } =>
  typeof error === 'object' && error !== null && 'userMessage' in error && typeof error.userMessage === 'string';

// Surfaces the last save/submit failure from FormActionsContext so save-and-continue actions on the
// intro, form and summary pages don't fail silently.
const FormActionError = () => {
  const { error } = useFormActions();
  const { translate } = useLanguage();

  const message = hasUserMessage(error) ? error.userMessage : error ? TEXTS.statiske.error.serverErrorTitle : undefined;
  if (!message) {
    return null;
  }

  return <Alert variant="error">{translate(message)}</Alert>;
};

export default FormActionError;
