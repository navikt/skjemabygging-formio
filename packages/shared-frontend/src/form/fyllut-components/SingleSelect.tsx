import { Checkbox, CheckboxGroup, Radio, RadioGroup } from '@navikt/ds-react';
import { ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode, forwardRef } from 'react';

interface Props {
  title: ReactNode;
  description: ReactNode;
  error?: ReactNode;
  values?: ComponentValue[];
  value?: string;
  className?: string;
  onChange: (value: string) => void;
}

const SingleSelect = forwardRef<HTMLFieldSetElement, Props>(
  ({ values = [], value, title, description, error, className, onChange }, ref) => {
    const handleChange = (selectedValues: string | string[]) => {
      onChange(Array.isArray(selectedValues) ? (selectedValues[0] ?? '') : selectedValues);
    };

    if (values.length === 1) {
      const [option] = values;
      return (
        <CheckboxGroup
          legend={title}
          description={description}
          error={error}
          onChange={handleChange}
          className={className}
          value={value ? [value] : []}
          ref={ref}
        >
          <Checkbox value={option.value}>{option.label}</Checkbox>
        </CheckboxGroup>
      );
    }

    if (values.length > 1) {
      return (
        <RadioGroup
          legend={title}
          description={description}
          error={error}
          onChange={handleChange}
          className={className}
          value={value}
          ref={ref}
          tabIndex={-1}
        >
          {values.map((option) => (
            <Radio key={option.value} value={option.value}>
              {option.label}
            </Radio>
          ))}
        </RadioGroup>
      );
    }

    return <div className="aksel-label">{title}</div>;
  },
);

export default SingleSelect;
