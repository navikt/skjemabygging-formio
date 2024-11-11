import { UNSAFE_Combobox } from '@navikt/ds-react';
import { ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
import { forwardRef, ReactNode } from 'react';

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

const Combobox = forwardRef<HTMLInputElement, Props>(
  ({ id, label, value, options = [], description, className, readOnly, onChange, error }: Props, ref) => {
    const handleChange = (selectedValue: string, selected: boolean) => {
      if (selected && selectedValue) {
        onChange({
          value: selectedValue,
          label: options?.find((option) => option.value === selectedValue)?.label,
        });
      } else {
        onChange(undefined);
      }
    };

    return (
      <UNSAFE_Combobox
        id={id}
        ref={ref}
        label={label}
        defaultValue={value || undefined}
        options={options}
        description={description}
        onToggleSelected={handleChange}
        className={className}
        readOnly={readOnly}
        error={error}
        isMultiSelect={false}
      />
    );
  },
);

export default Combobox;
