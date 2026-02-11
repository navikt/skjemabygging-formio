import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import FormTextField, { FormTextFieldProps } from '../form/FormTextField';

interface Props extends Omit<FormTextFieldProps, 'label'> {
  label?: string;
}

const FormPostalCode = (props: Props) => {
  const { label, ...rest } = props;

  return <FormTextField label={label ?? TEXTS.statiske.address.postalCode} autoComplete="postal-code" {...rest} />;
};

export default FormPostalCode;
