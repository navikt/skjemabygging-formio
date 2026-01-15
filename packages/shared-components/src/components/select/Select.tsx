import { Select as AkselSelect } from '@navikt/ds-react';
import { ComponentValue, FieldSize } from '@navikt/skjemadigitalisering-shared-domain';
import classNames from 'classnames';
import React, { forwardRef, ReactNode } from 'react';
import useComponentStyle from '../../util/styles/useComponentStyle';

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
  fieldSize?: FieldSize;
}

const Select = forwardRef<HTMLSelectElement, Props>(
  ({ id, label, value, options = [], description, className, readOnly, onChange, error, fieldSize }: Props, ref) => {
    const styles = useComponentStyle({
      fieldSize,
      cssSelector: '& .aksel-select__container',
    });
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedValue = event.currentTarget.value;
      if (selectedValue) {
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
      <AkselSelect
        id={id}
        ref={ref}
        label={label}
        value={value?.value}
        description={description}
        onChange={handleChange}
        className={classNames(styles.fieldSize, className)}
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
