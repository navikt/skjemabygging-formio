import { ComponentValue, FieldSize } from '@navikt/skjemadigitalisering-shared-domain';
import { forwardRef, ReactNode } from 'react';
import { getCountries } from '../../../util/countries/countries';
import Combobox from '../Combobox';

interface Props {
  id?: string;
  label: ReactNode;
  description?: ReactNode;
  className?: string;
  value?: ComponentValue | string;
  readOnly?: boolean;
  onChange: (value: any) => void;
  error?: ReactNode;
  ignoreOptions?: string[];
  fieldSize?: FieldSize;
}

const CountrySelect = forwardRef<HTMLInputElement, Props>(
  ({ id, label, value, description, className, readOnly, onChange, error, ignoreOptions, fieldSize }, ref) => {
    return (
      <Combobox
        id={id}
        ref={ref}
        label={label}
        value={value}
        options={getCountries('nb')}
        description={description}
        onChange={onChange}
        className={className}
        readOnly={readOnly}
        error={error}
        ignoreOptions={ignoreOptions}
        fieldSize={fieldSize}
      />
    );
  },
);

export default CountrySelect;
