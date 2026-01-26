import { Checkbox, CheckboxGroup, CheckboxGroupProps } from '@navikt/ds-react';
import { ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useRef } from 'react';
import { useForm } from '../../../../context/form/FormContext';
import { useLanguages } from '../../../../context/languages';
import { useInputValidation, Validators } from '../../../../context/validator/InputValidationContext';
import formComponentUtils from '../../../../form-components/utils/formComponent';
import FormBox, { FormBoxProps } from './FormBox';
import TranslatedDescription from './TranslatedDescription';
import TranslatedLabel from './TranslatedLabel';

interface FormCheckboxGroupProps extends Omit<CheckboxGroupProps, 'onChange' | 'ref' | 'children'>, FormBoxProps {
  submissionPath: string;
  legend: string;
  values: ComponentValue[];
  description?: string;
  validators?: Pick<Validators, 'required'>;
  onChange?: (value: string[]) => void;
}

const FormCheckbox = (props: FormCheckboxGroupProps) => {
  const {
    submissionPath,
    values,
    legend,
    description,
    validators = { required: true },
    bottom = 'space-40',
    inputWidth,
    onChange,
    ...rest
  } = props;
  const { updateSubmission, submission } = useForm();
  const { addValidation, removeValidation, getRefError } = useInputValidation();
  const { translate } = useLanguages();

  const ref = useRef(null);

  const handleChange = (value: string[]) => {
    if (onChange) {
      onChange(value);
    }

    updateSubmission(submissionPath, value);
  };

  useEffect(() => {
    addValidation(submissionPath, ref, validators, legend);
    return () => {
      removeValidation(submissionPath);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <FormBox inputWidth={inputWidth} bottom={bottom}>
      <CheckboxGroup
        legend={
          <TranslatedLabel options={{ required: validators?.required, readOnly: rest.readOnly }}>
            {legend}
          </TranslatedLabel>
        }
        description={<TranslatedDescription>{description}</TranslatedDescription>}
        onChange={handleChange}
        ref={ref}
        error={getRefError(ref)}
        defaultValue={formComponentUtils.getSubmissionValue(submissionPath, submission)}
        {...rest}
      >
        {values.map(({ value, label, description }) => (
          <Checkbox key={value} value={value} description={translate(description)}>
            {translate(label)}
          </Checkbox>
        ))}
      </CheckboxGroup>
    </FormBox>
  );
};

export default FormCheckbox;
export type { FormCheckboxGroupProps };
