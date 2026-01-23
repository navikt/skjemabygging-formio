import { Select, SelectProps } from '@navikt/ds-react';
import { ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
import { ChangeEvent, useEffect, useRef } from 'react';
import { useForm } from '../../../../context/form/FormContext';
import { useLanguages } from '../../../../context/languages';
import { useValidator, Validators } from '../../../../context/validator/ValidatorContext';
import formComponentUtils from '../../../../form-components/utils/formComponent';
import FormBox, { FormBoxProps } from './FormBox';
import TranslatedDescription from './TranslatedDescription';
import TranslatedLabel from './TranslatedLabel';

interface FormSelectProps extends Omit<SelectProps, 'onChange' | 'ref' | 'required' | 'children'>, FormBoxProps {
  submissionPath: string;
  label: string;
  selectText?: string;
  description?: string;
  values: ComponentValue[];
  validators?: Pick<Validators, 'required'>;
  onChange?: (value: string) => void;
}

const FormSelect = (props: FormSelectProps) => {
  const {
    submissionPath,
    label,
    description,
    values,
    validators = { required: true },
    bottom = 'space-40',
    inputWidth,
    selectText,
    onChange,
    ...rest
  } = props;
  const { updateSubmission, submission } = useForm();
  const { addValidation, removeValidation, getRefError } = useValidator();
  const { translate } = useLanguages();

  const ref = useRef(null);

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;

    if (onChange) {
      onChange(value);
    }

    updateSubmission(submissionPath, value);
  };

  useEffect(() => {
    addValidation(submissionPath, ref, validators, label);
    return () => {
      removeValidation(submissionPath);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <FormBox inputWidth={inputWidth} bottom={bottom}>
      <Select
        label={
          <TranslatedLabel options={{ required: validators?.required, readOnly: rest.readOnly }}>
            {label}
          </TranslatedLabel>
        }
        description={<TranslatedDescription>{description}</TranslatedDescription>}
        onChange={handleChange}
        ref={ref}
        error={getRefError(ref)}
        defaultValue={formComponentUtils.getSubmissionValue(submissionPath, submission)}
        {...rest}
      >
        {selectText && <option value=" ">{translate(selectText)}</option>}
        {values.map(({ value, label }) => (
          <option key={value} value={value}>
            {translate(label)}
          </option>
        ))}
      </Select>
    </FormBox>
  );
};

export default FormSelect;
export type { FormSelectProps };
