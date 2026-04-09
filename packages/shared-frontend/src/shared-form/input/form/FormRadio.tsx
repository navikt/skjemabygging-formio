import { Radio, RadioGroup } from '@navikt/ds-react';
import { ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
import { formComponentUtils } from '@navikt/skjemadigitalisering-shared-form';
import { useEffect, useRef } from 'react';
import { SharedFormInputRuntime, SharedFormInputValidators } from '../types';
import FormBox, { FormBoxProps } from './FormBox';
import TranslatedDescription from './TranslatedDescription';
import TranslatedLabel from './TranslatedLabel';

interface FormRadioProps extends FormBoxProps {
  submissionPath: string;
  legend: string;
  values: ComponentValue[];
  description?: string;
  runtime: SharedFormInputRuntime;
  validators?: Pick<SharedFormInputValidators, 'required'>;
  onChange?: (value: any) => void;
  readOnly?: boolean;
  error?: string;
}

const FormRadio = (props: FormRadioProps) => {
  const {
    submissionPath,
    values,
    legend,
    description,
    validators,
    bottom = 'space-32',
    runtime,
    onChange,
    readOnly,
    error,
  } = props;
  const {
    logger,
    submission,
    translate,
    updateSubmission,
    validation: { addValidation, removeValidation, getRefError },
  } = runtime;
  const { required } = validators || { required: true };

  const ref = useRef<HTMLFieldSetElement>(null);

  const handleChange = (value: string) => {
    if (onChange) {
      onChange(value);
    } else {
      updateSubmission(submissionPath, value);
    }
  };

  useEffect(() => {
    logger?.debug?.(`Add validation for ${submissionPath}`);
    addValidation(submissionPath, ref, { required }, legend);
    return () => {
      logger?.debug?.(`Remove validation for ${submissionPath}`);
      removeValidation(submissionPath);
    };
  }, [logger, addValidation, removeValidation, submissionPath, ref, required, legend]);

  const getDefaultValue = () => {
    const defaultValue = formComponentUtils.getSubmissionValue(submissionPath, submission);
    return defaultValue?.value ?? defaultValue;
  };

  return (
    <FormBox bottom={bottom}>
      <RadioGroup
        legend={
          <TranslatedLabel translate={translate} options={{ required, readOnly }}>
            {legend}
          </TranslatedLabel>
        }
        description={<TranslatedDescription translate={translate}>{description}</TranslatedDescription>}
        onChange={handleChange}
        ref={ref}
        // eslint-disable-next-line react-hooks/refs
        error={error ?? getRefError(ref)}
        defaultValue={getDefaultValue()}
      >
        {values.map(({ value, label, description }) => (
          <Radio key={value} value={value} description={description ? translate(description) : undefined}>
            {translate(label)}
          </Radio>
        ))}
      </RadioGroup>
    </FormBox>
  );
};

export default FormRadio;
export type { FormRadioProps };
