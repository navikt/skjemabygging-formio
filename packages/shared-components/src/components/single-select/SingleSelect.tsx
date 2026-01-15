import { Checkbox, CheckboxGroup, Radio, RadioGroup } from '@navikt/ds-react';
import { ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode, forwardRef } from 'react';

interface Props {
  title: ReactNode;
  description: ReactNode;
  error?: ReactNode;
  values?: ComponentValue[];
  value?: any;
  className?: string;
  onChange: (value: any) => void;
}

const SingleSelect = forwardRef<HTMLFieldSetElement, Props>(
  ({ values = [], value, title, description, error, className, onChange }: Props, ref) => {
    const handleChange = (values) => {
      onChange(Array.isArray(values) ? values[0] : values);
    };

    if (values.length === 1) {
      const [keyValueCheckbox] = values;
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
          <Checkbox value={keyValueCheckbox.value}>{keyValueCheckbox.label}</Checkbox>
        </CheckboxGroup>
      );
    } else if (values.length > 1) {
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
          {values.map((keyValue) => (
            <Radio key={keyValue.value} value={keyValue.value}>
              {keyValue.label}
            </Radio>
          ))}
        </RadioGroup>
      );
    } else {
      return <div className="aksel-label">{title}</div>;
    }
  },
);

export default SingleSelect;
