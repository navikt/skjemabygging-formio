import { Radio, RadioGroup, RadioGroupProps } from '@navikt/ds-react';
import { ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useRef } from 'react';
import { useForm } from '../../../../context/form/FormContext';
import { useLanguages } from '../../../../context/languages';
import { useValidator, Validators } from '../../../../context/validator/ValidatorContext';
import formComponentUtils from '../../../../form-components/utils/formComponent';
import FormBox, { FormBoxProps } from './FormBox';
import TranslatedDescription from './TranslatedDescription';
import TranslatedLabel from './TranslatedLabel';

interface FormRadioProps extends Omit<RadioGroupProps, 'onChange' | 'ref' | 'children' | 'legend'>, FormBoxProps {
  submissionPath: string;
  legend: string;
  values: ComponentValue[];
  description?: string;
  validators?: Pick<Validators, 'required'>;
  onChange?: (value: any) => void;
}

const FormRadio = (props: FormRadioProps) => {
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
  const { addValidation, removeValidation, getRefError } = useValidator();
  const { translate } = useLanguages();

  const ref = useRef(null);

  const handleChange = (value: string) => {
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
      <RadioGroup
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
          <Radio key={value} value={value} description={translate(description)}>
            {translate(label)}
          </Radio>
        ))}
      </RadioGroup>
    </FormBox>
  );
};

export default FormRadio;
export type { FormRadioProps };
