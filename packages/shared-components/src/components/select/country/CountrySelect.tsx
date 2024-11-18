import { ComponentValue, FieldSize } from '@navikt/skjemadigitalisering-shared-domain';
import { forwardRef, ReactNode, useMemo } from 'react';
import { useComponentUtils } from '../../../context/component/componentUtilsContext';
import { getCountries } from '../../../util/countries/countries';
import Combobox from '../Combobox';

interface Props {
  id?: string;
  label: ReactNode;
  description?: ReactNode;
  className?: string;
  value?: ComponentValue;
  readOnly?: boolean;
  onChange: (value: any) => void;
  error?: ReactNode;
  ignoreOptions?: string[];
  fieldSize?: FieldSize;
}

const CountrySelect = forwardRef<HTMLInputElement, Props>(
  ({ id, label, value, description, className, readOnly, onChange, error, ignoreOptions, fieldSize }, ref) => {
    const { translate } = useComponentUtils();

    const countries = useMemo(() => {
      return getCountries('nb').map((country) => {
        return {
          value: country.value,
          label: translate(country.label),
        };
      });
    }, [getCountries, translate]);

    return (
      <Combobox
        id={id}
        ref={ref}
        label={label}
        value={value}
        options={countries}
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
