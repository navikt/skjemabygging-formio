import { CheckboxGroup as AkselCheckboxGroup, Checkbox } from '@navikt/ds-react';
import { ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
import { Fragment, type ReactNode, type Ref } from 'react';
import { useLanguage } from '../../context/language/LanguageContext';
import { useFieldBinding } from '../../context/state/useFieldBinding';
import { inputId } from '../../utils/inputId';
import ReadMore from '../read-more/ReadMore';
import { toFieldValidation } from '../shared/fieldValidation';
import FormElementBox from '../shared/FormElementBox';
import TranslatedDescription from '../shared/TranslatedDescription';
import TranslatedLabel from '../shared/TranslatedLabel';
import { BaseFieldProps, ChoiceValidation } from '../types';

interface CheckboxGroupProps extends Omit<BaseFieldProps, 'label'> {
  legend: string;
  values: ComponentValue[];
  value?: string[];
  onChange?: (value: string[]) => unknown;
  error?: ReactNode;
  inputRef?: Ref<HTMLFieldSetElement>;
  children?: ReactNode;
  /** Content shown directly below the checkbox for the given option value. */
  renderBelowOption?: (value: string) => ReactNode;
  translateValues?: boolean;
  validation?: ChoiceValidation;
}

const CheckboxGroup = ({
  statePath,
  legend,
  values,
  description,
  required = true,
  readOnly,
  readMore,
  fieldSize,
  marginBottom,
  value,
  onChange,
  error: controlledError,
  inputRef,
  children,
  renderBelowOption,
  translateValues = true,
  validation,
}: CheckboxGroupProps) => {
  const { translate } = useLanguage();
  const fieldValidation = toFieldValidation({ statePath, label: legend, required, validation });
  const controlled = value !== undefined;
  const { stateValue, error, setStateValue } = useFieldBinding({
    statePath,
    controlled,
    // A controlled group validates the value its owner passes, which is the one it renders.
    validation: controlled ? { ...fieldValidation, value } : fieldValidation,
  });
  const current = value ?? (Array.isArray(stateValue) ? stateValue : []);
  const currentError = controlledError ?? error;

  return (
    <FormElementBox fieldSize={fieldSize} marginBottom={marginBottom}>
      <AkselCheckboxGroup
        id={inputId(statePath)}
        tabIndex={-1}
        legend={<TranslatedLabel required={required} readOnly={readOnly} translationKey={legend} />}
        description={description ? <TranslatedDescription translationKey={description} /> : undefined}
        value={current}
        onChange={(nextValue: string[]) => (onChange ? onChange(nextValue) : setStateValue(nextValue))}
        error={currentError}
        readOnly={readOnly}
        ref={inputRef}
      >
        {values.map(({ value, label, description }) => (
          <Fragment key={value}>
            <Checkbox value={value} description={description ? translate(description) : undefined}>
              {translateValues ? translate(label) : label}
            </Checkbox>
            {renderBelowOption?.(value)}
          </Fragment>
        ))}
        {children}
      </AkselCheckboxGroup>
      {readMore && <ReadMore {...readMore} />}
    </FormElementBox>
  );
};

export default CheckboxGroup;
export type { CheckboxGroupProps };
