import { Checkbox, CheckboxGroup } from '@navikt/ds-react';
import { ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useRef } from 'react';
import { useAppConfig } from '../../../../../context/config/configContext';
import { useForm } from '../../../../../context/form/FormContext';
import { useLanguages } from '../../../../../context/languages';
import { useInputValidation, Validators } from '../../../../../context/validator/InputValidationContext';
import formComponentUtils from '../../../../../form-components/utils/formComponent';
import FormBox, { FormBoxProps } from './FormBox';
import TranslatedDescription from './TranslatedDescription';
import TranslatedLabel from './TranslatedLabel';

interface FormCheckboxGroupProps extends FormBoxProps {
  submissionPath: string;
  legend: string;
  values: ComponentValue[];
  description?: string;
  validators?: Pick<Validators, 'required'>;
  onChange?: (value: string[]) => void;
  readOnly?: boolean;
  error?: string;
}

const FormCheckboxes = (props: FormCheckboxGroupProps) => {
  const {
    submissionPath,
    values,
    legend,
    description,
    validators,
    bottom = 'space-32',
    onChange,
    readOnly,
    error,
  } = props;
  const { logger } = useAppConfig();
  const { updateSubmission, submission } = useForm();
  const { addValidation, removeValidation, getRefError } = useInputValidation();
  const { translate } = useLanguages();
  const { required } = validators || { required: true };

  const ref = useRef(null);

  const handleChange = (value: string[]) => {
    if (onChange) {
      onChange(value);
    } else {
      updateSubmission(submissionPath, value);
    }
  };

  useEffect(() => {
    logger?.debug(`Add validation for ${submissionPath}`);
    addValidation(submissionPath, ref, { required }, legend);
    return () => {
      logger?.debug(`Remove validation for ${submissionPath}`);
      removeValidation(submissionPath);
    };
  }, [logger, addValidation, removeValidation, submissionPath, ref, required, legend]);

  const getDefaultValue = () => {
    const defaultValue = formComponentUtils.getSubmissionValue(submissionPath, submission);
    return defaultValue?.value ?? defaultValue;
  };

  return (
    <FormBox bottom={bottom}>
      <CheckboxGroup
        legend={<TranslatedLabel options={{ required, readOnly: readOnly }}>{legend}</TranslatedLabel>}
        description={<TranslatedDescription>{description}</TranslatedDescription>}
        onChange={handleChange}
        ref={ref}
        error={error ?? getRefError(ref)}
        defaultValue={getDefaultValue()}
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

export default FormCheckboxes;
export type { FormCheckboxGroupProps };
