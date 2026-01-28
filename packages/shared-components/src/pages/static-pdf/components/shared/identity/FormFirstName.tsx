import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import FormTextField, { FormTextFieldProps } from '../FormTextField';

interface Props extends Omit<FormTextFieldProps, 'label'> {
  label?: string;
}

const FormFirstName = (props: Props) => {
  const { label, ...rest } = props;

  return <FormTextField label={label ?? TEXTS.statiske.identity.firstName} autoComplete="given-name" {...rest} />;
};

export default FormFirstName;
