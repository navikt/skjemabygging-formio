import { UNSAFE_Combobox } from '@navikt/ds-react';
import { ComponentValue, FieldSize } from '@navikt/skjemadigitalisering-shared-domain';
import classNames from 'classnames';
import { forwardRef, ReactNode, useEffect, useState } from 'react';
import useComponentStyle from '../../util/styles/useComponentStyle';

interface Props {
  id?: string;
  label: ReactNode;
  description?: ReactNode;
  className?: string;
  value?: ComponentValue | string;
  options?: ComponentValue[];
  readOnly?: boolean;
  onChange: (value: any) => void;
  error?: ReactNode;
  ignoreOptions?: string[];
  fieldSize?: FieldSize;
}

const Combobox = forwardRef<HTMLInputElement, Props>(
  (
    {
      id,
      label,
      value,
      options = [],
      description,
      className,
      readOnly,
      onChange,
      error,
      ignoreOptions,
      fieldSize,
    }: Props,
    ref,
  ) => {
    const [filteredOptions, setFilteredOptions] = useState<ComponentValue[]>([]);

    useEffect(() => {
      setFilteredOptions(options?.filter((option) => !ignoreOptions?.includes(option.value)) ?? []);
    }, [options, ignoreOptions]);

    const styles = useComponentStyle({
      fieldSize,
      cssSelector: '& .navds-combobox__wrapper',
    });

    const handleChange = (selectedValue: string, selected: boolean) => {
      if (selected && selectedValue) {
        onChange({
          value: selectedValue,
          label: options?.find((option) => option.value === selectedValue)?.label,
        });
      } else {
        // Cant set to undefined or null since Formio ignore the value in updateValue, so we have to use empty string.
        onChange('');
      }
    };

    const getSelectedOptions = () => {
      if (value) {
        if (typeof value === 'string') {
          const selectedValue = options?.find((option) => option.value == value);
          if (selectedValue) {
            return [selectedValue];
          } else {
            return [];
          }
        }

        return [value];
      }

      return [];
    };

    return (
      <UNSAFE_Combobox
        id={id}
        ref={ref}
        label={label}
        selectedOptions={getSelectedOptions()}
        options={filteredOptions}
        description={description}
        onToggleSelected={handleChange}
        className={classNames(styles.fieldSize, className)}
        readOnly={readOnly}
        error={error}
        isMultiSelect={false}
      />
    );
  },
);

export default Combobox;
