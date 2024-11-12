import { UNSAFE_Combobox } from '@navikt/ds-react';
import { ComponentValue, FieldSize } from '@navikt/skjemadigitalisering-shared-domain';
import classNames from 'classnames';
import { forwardRef, ReactNode } from 'react';
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

const Combobox = forwardRef<HTMLInputElement, Props>(
  ({ id, label, value, options = [], description, className, readOnly, onChange, error, fieldSize }: Props, ref) => {
    const styles = useComponentStyle({
      fieldSize,
      cssPath: '& .navds-combobox__wrapper',
    });
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
        defaultValue={value?.value}
        options={options}
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
