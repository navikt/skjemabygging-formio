import { Select } from '@navikt/ds-react';
import { ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useAppConfig } from '../../../../context/config/configContext';
import { useForm } from '../../../../context/form/FormContext';
import { useLanguages } from '../../../../context/languages';
import { useInputValidation, Validators } from '../../../../context/validator/InputValidationContext';
import formComponentUtils from '../../../../form-components/utils/formComponent';
import FormBox, { FormBoxProps } from './FormBox';
import TranslatedDescription from './TranslatedDescription';
import TranslatedLabel from './TranslatedLabel';

interface FormSelectProps extends FormBoxProps {
  submissionPath: string;
  label: string;
  selectText?: string;
  description?: string;
  values: ComponentValue[];
  validators?: Pick<Validators, 'required'>;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  error?: string;
}

const FormSelect = (props: FormSelectProps) => {
  const {
    submissionPath,
    label,
    description,
    values,
    validators,
    bottom = 'space-32',
    inputWidth,
    selectText,
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
  const [refError, setRefError] = useState<string | undefined>();

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;

    if (onChange) {
      onChange(value);
    }

    updateSubmission(submissionPath, value);
  };

  useEffect(() => {
    logger?.debug(`Add validation for ${submissionPath}`);
    addValidation(submissionPath, ref, { required }, label);
    return () => {
      logger?.debug(`Remove validation for ${submissionPath}`);
      removeValidation(submissionPath);
    };
  }, [logger, addValidation, removeValidation, submissionPath, ref, required, label]);

  useEffect(() => {
    setRefError(getRefError(ref));
  }, [getRefError, submissionPath]);

  return (
    <FormBox inputWidth={inputWidth} bottom={bottom}>
      <Select
        label={<TranslatedLabel options={{ required, readOnly }}>{label}</TranslatedLabel>}
        description={<TranslatedDescription>{description}</TranslatedDescription>}
        onChange={handleChange}
        ref={ref}
        error={error ?? refError}
        defaultValue={formComponentUtils.getSubmissionValue(submissionPath, submission)}
      >
        {selectText && <option value="">{translate(selectText)}</option>}
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
