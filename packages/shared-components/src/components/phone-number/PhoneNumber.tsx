import { Select, TextField } from '@navikt/ds-react';
import {
  CustomLabels,
  FieldSize,
  formatPhoneNumber,
  removeAllSpaces,
} from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useEffect, useState } from 'react';

interface Props {
  label: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  value?: string;
  onChange: (value: any) => void;
  error?: React.ReactNode;
  readOnly?: boolean;
  fieldSize?: FieldSize;
  required?: boolean;
  customLabels?: CustomLabels;
  showAreaCode?: boolean;
}

type AreaCode = { value: string; label: string };

type PhoneNumber = {
  areaCode?: string;
  number: string;
};

const PhoneNumber = ({ onChange, showAreaCode }: Props) => {
  // const { baseUrl } = useAppConfig();
  const [areaCodes, setAreaCodes] = useState<AreaCode[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState<PhoneNumber>({ number: '', areaCode: undefined });

  const fetchAreaCodes = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      // const data = await getAreaCodes(baseUrl);
      const data = [
        { value: '+47', label: 'Norge (+47)' },
        { value: '+46', label: 'Sverige (+46)' },
      ];
      setAreaCodes(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error as string);
      setAreaCodes([]);
    }
  }, []);

  useEffect(() => {
    if (showAreaCode) {
      fetchAreaCodes();
    }
  }, [fetchAreaCodes, showAreaCode, phoneNumber]);

  if (loading || !areaCodes.length) return null;

  function handleChange(value: string, key: string) {
    setPhoneNumber({ ...phoneNumber, [key]: removeAllSpaces(value) });
    onChange(phoneNumber);
  }

  function onBlur() {
    const { areaCode, number } = phoneNumber;
    if (showAreaCode) {
      setPhoneNumber({ ...phoneNumber, number: formatPhoneNumber(number, areaCode) });
    } else {
      setPhoneNumber({ ...phoneNumber, number: formatPhoneNumber(number, '+47') });
    }
  }

  if (error) return <p>En feil oppsto under uthenting av landskoder</p>;

  return (
    <>
      {showAreaCode && (
        <Select
          label={'Landskode'}
          onChange={(event) => handleChange(event.target.value, 'areaCode')}
          defaultValue={phoneNumber.areaCode}
        >
          <option value="">Velg landkode</option>
          {areaCodes?.map((areaCode) => (
            <option key={areaCode.value} value={areaCode.value}>
              {areaCode.label}
            </option>
          ))}
        </Select>
      )}
      <TextField
        label="Telefonnummer"
        type="tel"
        onChange={(event) => handleChange(event.target.value, 'number')}
        onBlur={onBlur}
        defaultValue={formatPhoneNumber(phoneNumber.number, phoneNumber.areaCode)}
        onFocus={() => setPhoneNumber({ ...phoneNumber, number: removeAllSpaces(phoneNumber.number) })}
      />
    </>
  );
};
export default PhoneNumber;
