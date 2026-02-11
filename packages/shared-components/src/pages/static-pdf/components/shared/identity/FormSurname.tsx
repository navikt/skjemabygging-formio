import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import FormTextField, { FormTextFieldProps } from '../form/FormTextField';

interface Props extends Omit<FormTextFieldProps, 'label'> {
  label?: string;
}

const FormSurname = (props: Props) => {
  const { label, ...rest } = props;

  return <FormTextField label={label ?? TEXTS.statiske.identity.surname} autoComplete="family-name" {...rest} />;
};

export default FormSurname;
