import { Select as AkselSelect } from '@navikt/ds-react';
import { ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
import React, { forwardRef, ReactNode } from 'react';

interface Props {
  id: string;
  label: ReactNode;
  description: ReactNode;
  className: string;
  value?: any;
  options?: ComponentValue[];
  readOnly?: boolean;
  onChange: (value: any) => void;
  error: ReactNode;
}

const Select = forwardRef<HTMLSelectElement, Props>(
  ({ id, label, value, options = [], description, className, readOnly, onChange, error }: Props, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedValue = event.currentTarget.value;
      if (selectedValue) {
        onChange({
          value: selectedValue,
          label: options?.find((option) => option.value === selectedValue)?.label,
        });
      } else {
        onChange(undefined);
      }
    };

    return (
      <AkselSelect
        id={id}
        ref={ref}
        label={label}
        defaultValue={value}
        description={description}
        onChange={handleChange}
        className={className}
        readOnly={readOnly}
        error={error}
      >
        {options.map((keyValue) => (
          <option key={keyValue.value} value={keyValue.value}>
            {keyValue.label}
          </option>
        ))}
      </AkselSelect>
    );
  },
);

export default Select;
