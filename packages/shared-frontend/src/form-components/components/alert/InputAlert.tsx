import { Alert } from '@navikt/ds-react';
import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguage } from '../../../context/language/LanguageContext';
import InputBox from '../../input/InputBox';
import { sanitizeHtml } from '../../shared/sanitizeHtml';

interface InputAlertProps {
  component: Component;
}

const getVariant = (alertType?: string) => {
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
    <InputBox>
      <Alert variant={getVariant(component.alerttype)} inline={component.isInline} fullWidth={false} size="medium">
        <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(translate(component.content)) }} />
      </Alert>
    </InputBox>
  );
};

export default InputAlert;
