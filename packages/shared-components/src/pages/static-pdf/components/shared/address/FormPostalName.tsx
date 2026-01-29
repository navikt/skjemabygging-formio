import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import FormTextField, { FormTextFieldProps } from '../FormTextField';

interface Props extends Omit<FormTextFieldProps, 'label'> {
  label?: string;
}

const FormPostalName = (props: Props) => {
  const { label, ...rest } = props;

  return <FormTextField label={label ?? TEXTS.statiske.address.postalName} autoComplete="address-level2" {...rest} />;
};

export default FormPostalName;
