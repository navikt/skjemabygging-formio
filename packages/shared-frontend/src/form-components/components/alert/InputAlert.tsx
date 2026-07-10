import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import Alert, { AlertVariant } from '../../../components/alert/Alert';
import { useLanguage } from '../../../context/language/LanguageContext';
import { sanitizeHtml } from '../../../utils/sanitizeHtml';

interface InputAlertProps {
  component: Component;
}

const getVariant = (alertType?: string): AlertVariant => {
  switch (alertType) {
    case 'suksess':
      return 'success';
    case 'advarsel':
      return 'warning';
    case 'feil':
      return 'error';
    default:
      return 'info';
  }
};

const InputAlert = ({ component }: InputAlertProps) => {
  const { translate } = useLanguage();

  if (!component.content) {
    return null;
  }

  return (
    <Alert variant={getVariant(component.alerttype)} inline={component.isInline}>
      <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(translate(component.content)) }} />
    </Alert>
  );
};

export default InputAlert;
