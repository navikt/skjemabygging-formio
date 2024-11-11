import { ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
import { forwardRef, ReactNode, useEffect, useState } from 'react';
import { getCountries } from '../../../util/countries/countries';
import ComboSelect from '../ComboSelect';

interface Props {
  id: string;
  label: ReactNode;
  description: ReactNode;
  className: string;
  value?: any;
  readOnly?: boolean;
  onChange: (value: any) => void;
  error: ReactNode;
  ignoreOptions: string[];
}

const CountrySelect = forwardRef<HTMLInputElement | HTMLSelectElement, Props>(
  ({ id, label, value, description, className, readOnly, onChange, error, ignoreOptions }, ref) => {
    const [countries, setCountries] = useState<ComponentValue[]>();

    useEffect(() => {
      // Get Norwegian countries no matter what language is selected,
      // so the translator translate them normally with Norwegian langauge as key.
      setCountries(getCountries('nb'));
      //setCountries(getCountries('nb').splice(0, 5));
    }, []);

    return (
      <ComboSelect
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
      />
    );
  },
);

export default CountrySelect;
