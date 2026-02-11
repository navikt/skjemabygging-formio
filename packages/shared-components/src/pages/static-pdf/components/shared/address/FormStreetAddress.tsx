import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import FormTextField, { FormTextFieldProps } from '../form/FormTextField';

interface Props extends Omit<FormTextFieldProps, 'label'> {
  label?: string;
}

const FormStreetAddress = (props: Props) => {
  const { label, ...rest } = props;

  return (
    <FormTextField label={label ?? TEXTS.statiske.address.streetAddress} autoComplete="street-address" {...rest} />
  );
};

export default FormStreetAddress;
