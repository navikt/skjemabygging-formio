import { ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
import { ForwardedRef, forwardRef, ReactNode, useEffect, useState } from 'react';
import Combobox from './Combobox';
import Select from './Select';

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
  ignoreOptions: string[];
}

const ComboSelect = forwardRef<HTMLInputElement | HTMLSelectElement, Props>(
  ({ id, label, value, options, description, className, readOnly, onChange, error, ignoreOptions }: Props, ref) => {
    const [filteredOptions, setFilteredOptions] = useState<ComponentValue[]>([]);

    useEffect(() => {
      setFilteredOptions(options?.filter((option) => !ignoreOptions.includes(option.value)) ?? []);
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
        />
      );
    }
  },
);

export default ComboSelect;
