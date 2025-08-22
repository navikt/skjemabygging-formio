import { Select, TextField } from '@navikt/ds-react';
import {
  CustomLabels,
  FieldSize,
  formatPhoneNumber,
  removeAllSpaces,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import clsx from 'clsx';
import { useCallback, useEffect, useState } from 'react';
import { getAreaCodes } from '../../api/common-codes/area-codes';
import { useComponentUtils } from '../../context/component/componentUtilsContext';
import { PhoneNumberObject } from '../../formio/components/core/phone-number/PhoneNumber';
import { FieldsetErrorMessage } from '../error/FieldsetErrorMessage';
import { usePhoneNumberStyles } from './styles';
import { getInitialPhoneNumber } from './utils';

interface Props {
  label: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  value: string | PhoneNumberObject;
  onChange: (value: any) => void;
  error?: React.ReactNode;
  readOnly?: boolean;
  fieldSize?: FieldSize;
  required?: boolean;
  customLabels?: CustomLabels;
  showAreaCode: boolean;
}

type AreaCode = { value: string; label: string };

type PhoneNumber = {
  areaCode: string;
  number: string;
};

const PhoneNumber = ({ value, onChange, showAreaCode, error }: Props) => {
  const { appConfig } = useComponentUtils();
  const [areaCodes, setAreaCodes] = useState<AreaCode[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState<PhoneNumber | string>(getInitialPhoneNumber(value, showAreaCode));
  const styles = usePhoneNumberStyles();
  const defaultAreaCode = '+47';

  const fetchAreaCodes = useCallback(async () => {
    setFetchError(null);
    setLoading(true);
    try {
      const data = await getAreaCodes(appConfig.fyllutBaseURL);
      setAreaCodes(data);
    } catch (error) {
      setFetchError(error instanceof Error ? error.message : String(error));
      setAreaCodes([]);
    } finally {
      setLoading(false);
    }
  }, [appConfig.fyllutBaseURL]);

  useEffect(() => {
    if (showAreaCode) {
      fetchAreaCodes();
    }
  }, [fetchAreaCodes, showAreaCode, appConfig.fyllutBaseURL]);

  if (showAreaCode && (loading || !areaCodes.length)) return null;

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
    }
  }

  function handleFocus() {
    if (showAreaCode && typeof phoneNumber === 'object' && phoneNumber) {
      setPhoneNumber({ ...phoneNumber, number: removeAllSpaces(phoneNumber.number) });
    } else if (!showAreaCode && typeof phoneNumber === 'string') {
      setPhoneNumber(removeAllSpaces(phoneNumber));
    }
  }

  if (fetchError) return <p>En feil oppsto under uthenting av landskoder</p>;

  return (
    <div>
      <div className={clsx('input--xxl', styles.wrapper)}>
        {showAreaCode && (
          <Select
            label={TEXTS.statiske.phoneNumber.areaCodeLabel}
            hideLabel
            className={clsx(
              typeof phoneNumber === 'object' && phoneNumber.areaCode.length === 3
                ? styles.areaCodesSelect65
                : styles.areaCodesSelect75,
            )}
            onChange={(event) => handleChange(event.target.value, 'areaCode')}
            defaultValue={typeof value === 'object' && value ? value.areaCode : defaultAreaCode}
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
          label={TEXTS.statiske.phoneNumber.phoneNumberLabel}
          type="tel"
          className={styles.phoneNumber}
          onChange={(event) => handleChange(event.target.value, 'number')}
          onBlur={handleBlur}
          value={typeof phoneNumber === 'object' && phoneNumber ? phoneNumber.number : phoneNumber}
          onFocus={handleFocus}
        />
      </div>
      {error && <FieldsetErrorMessage errorMessage={error as string} className={styles.error} />}
    </div>
  );
};
export default PhoneNumber;
