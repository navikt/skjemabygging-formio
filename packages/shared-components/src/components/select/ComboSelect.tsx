import { ComponentValue, FieldSize } from '@navikt/skjemadigitalisering-shared-domain';
import { ForwardedRef, forwardRef, ReactNode, useEffect, useState } from 'react';
import Combobox from './Combobox';
import Select from './Select';

interface Props {
  id: string;
  label: ReactNode;
  description?: ReactNode;
  className?: string;
  value?: ComponentValue;
  options?: ComponentValue[];
  readOnly?: boolean;
  onChange: (value: any) => void;
  error?: ReactNode;
  ignoreOptions?: string[];
  fieldSize?: FieldSize;
}

const ComboSelect = forwardRef<HTMLInputElement | HTMLSelectElement, Props>(
  (
    { id, label, value, options, description, className, readOnly, onChange, error, ignoreOptions, fieldSize }: Props,
    ref,
  ) => {
    const [filteredOptions, setFilteredOptions] = useState<ComponentValue[]>([]);

    useEffect(() => {
      setFilteredOptions(options?.filter((option) => !ignoreOptions?.includes(option.value)) ?? []);
    }, [options, ignoreOptions]);

    if (!options || options.length === 0) {
      return <div className="navds-label">{label}</div>;
    } else if (options.length > 8) {
      return (
        <Combobox
          id={id}
          ref={ref as ForwardedRef<HTMLInputElement>}
          label={label}
          value={value}
          options={filteredOptions}
          description={description}
          onChange={onChange}
          className={className}
          readOnly={readOnly}
          error={error}
          fieldSize={fieldSize}
        />
      );
    } else {
      return (
        <Select
          id={id}
          ref={ref as ForwardedRef<HTMLSelectElement>}
          label={label}
          value={value}
          description={description}
          onChange={onChange}
          className={className}
          readOnly={readOnly}
          error={error}
          options={options}
          fieldSize={fieldSize}
        />
      );
    }
  },
);

export default ComboSelect;
