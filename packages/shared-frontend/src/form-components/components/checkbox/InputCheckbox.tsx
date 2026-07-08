import { Checkbox, CheckboxGroup } from '@navikt/ds-react';
import { Component, ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguage } from '../../../context/language/LanguageContext';
import InputBox, { Spacing } from '../../input/InputBox';
import TranslatedDescription from '../../input/TranslatedDescription';
import TranslatedLabel from '../../input/TranslatedLabel';
import { inputId } from '../../input/inputId';
import { useSubmissionField } from '../../input/useSubmissionField';

interface InputCheckboxProps {
  pageKey: string;
  pageComponents: Component[];
  submissionPath: string;
  legend: string;
  values: ComponentValue[];
  description?: string;
  required?: boolean;
  readOnly?: boolean;
  bottom?: Spacing;
}

const InputCheckbox = ({
  pageKey,
  pageComponents,
  submissionPath,
  legend,
  values,
  description,
  required = true,
  readOnly,
  bottom,
}: InputCheckboxProps) => {
  const { translate } = useLanguage();
  const { submissionValue, error, setSubmissionValue } = useSubmissionField({
    pageKey,
    pageComponents,
    submissionPath,
  });
  const current = submissionValue ?? [];

  const onChange = (value: string[]) => {
    setSubmissionValue(value);
  };

  return (
    <InputBox bottom={bottom}>
      <CheckboxGroup
        id={inputId(submissionPath)}
        legend={
          <TranslatedLabel required={required} readOnly={readOnly}>
            {legend}
          </TranslatedLabel>
        }
        description={<TranslatedDescription>{description}</TranslatedDescription>}
        value={current}
        onChange={onChange}
        error={error}
        readOnly={readOnly}
      >
        {values.map(({ value, label }) => (
          <Checkbox key={value} value={value}>
            {translate(label)}
          </Checkbox>
        ))}
      </CheckboxGroup>
    </InputBox>
  );
};

export default InputCheckbox;
export type { InputCheckboxProps };
