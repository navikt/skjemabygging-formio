import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import FormTextField, { FormTextFieldProps } from '../form/FormTextField';

interface Props extends Omit<FormTextFieldProps, 'label'> {
  label?: string;
}

const FormNationalIdentityNumber = (props: Props) => {
  const { label, ...rest } = props;

  return (
    <FormTextField
      label={label ?? TEXTS.statiske.identity.identityNumber}
      {...rest}
      autoComplete="off"
      validators={{ nationalIdentityNumber: true }}
    />
  );
};

export default FormNationalIdentityNumber;
