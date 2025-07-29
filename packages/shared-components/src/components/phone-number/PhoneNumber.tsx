import { Select, TextField } from '@navikt/ds-react';
import {
  CustomLabels,
  FieldSize,
  formatPhoneNumber,
  removeAllSpaces,
} from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useEffect, useState } from 'react';
import { getAreaCodes } from '../../api/common-codes/area-codes';
import { useComponentUtils } from '../../context/component/componentUtilsContext';
import { PhoneNumberObject } from '../../formio/components/core/phone-number/PhoneNumber';

interface Props {
  label: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  value?: string | PhoneNumberObject;
  onChange: (value: any) => void;
  error?: React.ReactNode;
  readOnly?: boolean;
  fieldSize?: FieldSize;
  required?: boolean;
  customLabels?: CustomLabels;
  showAreaCode?: boolean;
  onBlur: (value: any) => void;
}

type AreaCode = { value: string; label: string };

type PhoneNumber = {
  areaCode: string;
  number: string;
};

const PhoneNumber = ({ value, onChange, showAreaCode, onBlur }: Props) => {
  const { appConfig } = useComponentUtils();
  const [areaCodes, setAreaCodes] = useState<AreaCode[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState<PhoneNumber | string>(
    showAreaCode
      ? { areaCode: '+47', number: typeof value === 'object' && value ? (value.number ?? '') : '' }
      : typeof value === 'string'
        ? value
        : '',
  );

  const fetchAreaCodes = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await getAreaCodes(appConfig.fyllutBaseURL);
      setAreaCodes(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error as string);
      setAreaCodes([]);
    }
  }, [appConfig.fyllutBaseURL]);

  useEffect(() => {
    if (showAreaCode) {
      fetchAreaCodes();
    }
  }, [fetchAreaCodes, showAreaCode, appConfig.fyllutBaseURL]);

  if (loading || !areaCodes.length) return null;

  function handleChange(value: string, key: string) {
    if (showAreaCode) {
      const updated: PhoneNumber = {
        ...(typeof phoneNumber === 'object' && phoneNumber ? phoneNumber : { areaCode: '+47', number: '' }),
        [key]: removeAllSpaces(value),
      };
      setPhoneNumber(updated);
      onChange(updated);
    } else {
      const updated = removeAllSpaces(value);
      setPhoneNumber(updated);
      onChange(updated);
    }
  }

  function handleBlur() {
    if (showAreaCode && typeof phoneNumber === 'object' && phoneNumber) {
      const { areaCode, number } = phoneNumber;
      const updated = { ...phoneNumber, number: formatPhoneNumber(number, areaCode) };
      setPhoneNumber(updated);
      // onChange(updated);
      onBlur(updated);
    } else if (!showAreaCode && typeof phoneNumber === 'string') {
      const updated = formatPhoneNumber(phoneNumber, '+47');
      setPhoneNumber(updated);
      // onChange(updated);
      onBlur(updated);
    }
  }

  function handleFocus() {
    if (showAreaCode && typeof phoneNumber === 'object' && phoneNumber) {
      setPhoneNumber({ ...phoneNumber, number: removeAllSpaces(phoneNumber.number) });
      onChange(removeAllSpaces(phoneNumber.number));
    } else if (!showAreaCode && typeof phoneNumber === 'string') {
      setPhoneNumber(removeAllSpaces(phoneNumber));
      onChange(removeAllSpaces(phoneNumber));
    }
  }

  if (error) return <p>En feil oppsto under uthenting av landskoder</p>;

  return (
    <div className="input--xxl" style={{ display: 'flex' }}>
      {showAreaCode && (
        <Select
          label={'Landskode'}
          hideLabel
          onChange={(event) => handleChange(event.target.value, 'areaCode')}
          defaultValue={typeof phoneNumber === 'object' && phoneNumber ? phoneNumber.areaCode || '+47' : '+47'}
          error={!!error}
          style={{ flex: '1' }}
        >
          {areaCodes?.map((areaCode) => (
            <option key={areaCode.value} value={areaCode.value}>
              {areaCode.label}
            </option>
          ))}
        </Select>
      )}
      <TextField
        hideLabel
        label="Telefonnummer"
        type="tel"
        onChange={(event) => handleChange(event.target.value, 'number')}
        onBlur={handleBlur}
        defaultValue={
          typeof phoneNumber === 'object' && phoneNumber
            ? formatPhoneNumber(phoneNumber.number, phoneNumber.areaCode)
            : phoneNumber
        }
        onFocus={handleFocus}
        style={{ flex: '4' }}
      />
    </div>
  );
};
export default PhoneNumber;
