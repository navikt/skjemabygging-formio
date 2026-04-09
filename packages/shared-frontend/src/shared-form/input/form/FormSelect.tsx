import { Select } from '@navikt/ds-react';
import { ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
import { formComponentUtils } from '@navikt/skjemadigitalisering-shared-form';
import { ChangeEvent, useEffect, useRef } from 'react';
import { FormInputWidth, useFormInputStyles } from '../formStylingUtil';
import { SharedFormInputRuntime, SharedFormInputValidators } from '../types';
import FormBox, { FormBoxProps } from './FormBox';
import TranslatedDescription from './TranslatedDescription';
import TranslatedLabel from './TranslatedLabel';

interface FormSelectProps extends FormBoxProps {
  submissionPath: string;
  label: string;
  selectText?: string;
  description?: string;
  values: ComponentValue[];
  runtime: SharedFormInputRuntime;
  validators?: Pick<SharedFormInputValidators, 'required'>;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  error?: string;
  autoComplete?: string;
  width?: FormInputWidth;
}

const FormSelect = (props: FormSelectProps) => {
  const {
    submissionPath,
    label,
    description,
    values,
    validators,
    bottom = 'space-32',
    width = 'input--xl',
    runtime,
    selectText,
    onChange,
    readOnly,
    error,
    autoComplete,
  } = props;
  const {
    logger,
    submission,
    translate,
    updateSubmission,
    validation: { addValidation, removeValidation, getRefError },
  } = runtime;
  const { required } = validators || { required: true };
  const styles = useFormInputStyles();

  const ref = useRef<HTMLSelectElement>(null);

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;

    if (onChange) {
      onChange(value);
    } else {
      updateSubmission(submissionPath, value);
    }
  };

  useEffect(() => {
    logger?.debug?.(`Add validation for ${submissionPath}`);
    addValidation(submissionPath, ref, { required }, label);
    return () => {
      logger?.debug?.(`Remove validation for ${submissionPath}`);
      removeValidation(submissionPath);
    };
  }, [logger, addValidation, removeValidation, submissionPath, ref, required, label]);

  const getDefaultValue = () => {
    const defaultValue = formComponentUtils.getSubmissionValue(submissionPath, submission);
    return defaultValue?.value ?? defaultValue;
  };

  return (
    <FormBox bottom={bottom}>
      <Select
        className={styles[width ?? 'input--xl']}
        label={
          <TranslatedLabel translate={translate} options={{ required, readOnly }}>
            {label}
          </TranslatedLabel>
        }
        description={<TranslatedDescription translate={translate}>{description}</TranslatedDescription>}
        onChange={handleChange}
        ref={ref}
        // eslint-disable-next-line react-hooks/refs
        error={error ?? getRefError(ref)}
        autoComplete={autoComplete}
        defaultValue={getDefaultValue()}
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
