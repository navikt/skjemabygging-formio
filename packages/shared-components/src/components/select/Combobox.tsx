import { UNSAFE_Combobox } from '@navikt/ds-react';
import { ComponentValue, FieldSize } from '@navikt/skjemadigitalisering-shared-domain';
import clsx from 'clsx';
import { forwardRef, ReactNode, useMemo } from 'react';
import useComponentStyle from '../../util/styles/useComponentStyle';

interface Props {
  id?: string;
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
    const filteredOptions = useMemo(
      () => options?.filter((option) => !ignoreOptions?.includes(option.value)) ?? [],
      [options, ignoreOptions],
    );

    const styles = useComponentStyle({
      fieldSize,
      cssSelector: '& .aksel-combobox__wrapper',
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

    return (
      <UNSAFE_Combobox
        id={id}
        ref={ref}
        label={label}
        selectedOptions={value ? [value] : []}
        options={filteredOptions}
        description={description}
        onToggleSelected={handleChange}
        className={clsx(styles.fieldSize, className)}
        readOnly={readOnly}
        error={error}
        isMultiSelect={false}
        shouldAutocomplete={true}
      />
    );
  },
);

export default Combobox;
