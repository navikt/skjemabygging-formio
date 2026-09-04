import Alert, { AlertVariant } from '../../../components/alert/Alert';
import { useLanguage } from '../../../context/language/LanguageContext';
import { sanitizeHtml } from '../../../utils/sanitizeHtml';
import { AlertDefinition } from '../../component-types';
import FormGroup from '../../shared/FormGroup';

interface InputAlertProps {
  component: AlertDefinition;
}

const getVariant = (alertType?: string): AlertVariant => {
  switch (alertType) {
    case 'suksess':
    case 'success':
      return 'success';
    case 'advarsel':
    case 'warning':
      return 'warning';
    case 'feil':
    case 'error':
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
    <FormGroup>
      <Alert variant={getVariant(component.alerttype)} inline={component.isInline}>
        <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(translate(component.content)) }} />
      </Alert>
    </FormGroup>
  );
};

export default InputAlert;
