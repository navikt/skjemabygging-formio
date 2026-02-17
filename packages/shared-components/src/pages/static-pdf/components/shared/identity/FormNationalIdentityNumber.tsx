import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { Validators } from '../../../../../context/validator/Validators';
import FormTextField, { FormTextFieldProps } from '../form/FormTextField';

interface Props extends Omit<FormTextFieldProps, 'label'> {
  label?: string;
  validators?: Pick<Validators, 'required'>;
}

const FormNationalIdentityNumber = (props: Props) => {
  const { label, validators, ...rest } = props;
  const { required } = validators || { required: true };

  return (
    <FormTextField
      label={label ?? TEXTS.statiske.identity.identityNumber}
      {...rest}
      autoComplete="off"
      validators={{ required, nationalIdentityNumber: true }}
    />
  );
};

export default FormNationalIdentityNumber;
