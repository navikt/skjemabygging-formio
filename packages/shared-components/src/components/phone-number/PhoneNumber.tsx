import { Alert, BodyShort, Select, TextField } from '@navikt/ds-react';
import {
  CustomLabels,
  FieldSize,
  formatPhoneNumber,
  removeAllSpaces,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import clsx from 'clsx';
import { useCallback, useEffect, useId, useState } from 'react';
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
  labelId?: string;
  phoneInputId?: string;
  areaCodeSelectId?: string;
}

type AreaCode = { value: string; label: string };

type PhoneNumber = {
  areaCode: string;
  number: string;
};

const PhoneNumber = ({ value, onChange, showAreaCode, error, labelId, phoneInputId, areaCodeSelectId }: Props) => {
  const { translate, appConfig, addRef, getComponentError } = useComponentUtils();
  const [areaCodes, setAreaCodes] = useState<AreaCode[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState<PhoneNumber | string>(getInitialPhoneNumber(value, showAreaCode));
  const styles = usePhoneNumberStyles();
  const generatedId = useId();
  const resolvedLabelId = labelId ?? `${generatedId}-label`;
  const resolvedAreaCodeId = areaCodeSelectId ?? `${generatedId}-area-code`;
  const resolvedPhoneInputId = phoneInputId ?? `${generatedId}-phone`;
  const areaCodeLabel = translate(TEXTS.statiske.phoneNumber.areaCodeLabel);
  const phoneNumberLabel = translate(TEXTS.statiske.phoneNumber.phoneNumberLabel);
  const defaultAreaCode = '+47';

  const fetchAreaCodes = useCallback(async () => {
    setFetchError(null);
    setLoading(true);
    try {
      const data = await getAreaCodes(appConfig.fyllutBaseURL);
      setAreaCodes(data);
    } catch (error) {
      setAreaCodes([{ value: defaultAreaCode, label: defaultAreaCode }]);
      setFetchError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  }, [appConfig.fyllutBaseURL]);

  useEffect(() => {
    if (showAreaCode) {
      fetchAreaCodes();
    }
  }, [fetchAreaCodes, showAreaCode, appConfig.fyllutBaseURL]);

  function handleChange(value: string, key: string) {
    if (showAreaCode) {
      const updated: PhoneNumber = {
        ...(typeof phoneNumber === 'object' && phoneNumber ? phoneNumber : { areaCode: '+47', number: '' }),
        [key]: removeAllSpaces(value),
      };
      setPhoneNumber(updated);
      onChange(updated);
    } else {
      setPhoneNumber(value);
      onChange(value);
    }
  }

  function handleBlur() {
    if (showAreaCode && typeof phoneNumber === 'object' && phoneNumber) {
      const { areaCode, number } = phoneNumber;
      const updated = { ...phoneNumber, number: formatPhoneNumber(number, areaCode) };
      setPhoneNumber(updated);
      const updatedNoSpace = { ...phoneNumber, number: removeAllSpaces(number) };
      onChange(updatedNoSpace);
    }
  }

  function handleFocus() {
    if (showAreaCode && typeof phoneNumber === 'object' && phoneNumber) {
      setPhoneNumber({ ...phoneNumber, number: removeAllSpaces(phoneNumber.number) });
    } else if (!showAreaCode && typeof phoneNumber === 'string') {
      setPhoneNumber(removeAllSpaces(phoneNumber));
    }
  }

  return (
    <>
      <div className={clsx('input--xxl', styles.wrapper)} tabIndex={-1}>
        {showAreaCode && !loading && areaCodes.length > 0 && (
          <Select
            id={resolvedAreaCodeId}
            label={areaCodeLabel}
            hideLabel
            aria-labelledby={resolvedLabelId}
            className={clsx(
              typeof phoneNumber === 'object' && phoneNumber.areaCode.length === 3
                ? styles.areaCodeSelectShort
                : styles.areaCodeSelectLong,
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
          id={resolvedPhoneInputId}
          hideLabel
          label={phoneNumberLabel}
          aria-labelledby={resolvedLabelId}
          type="tel"
          className={styles.phoneNumber}
          onChange={(event) => handleChange(event.target.value, 'number')}
          onBlur={handleBlur}
          value={typeof phoneNumber === 'object' && phoneNumber ? phoneNumber.number : phoneNumber}
          onFocus={handleFocus}
          ref={(ref) => addRef('phoneNumber', ref)}
        />
      </div>

      {fetchError && (
        <Alert variant="warning" className={styles.fetchError}>
          <BodyShort>{translate(TEXTS.statiske.phoneNumber.fetchError)}</BodyShort>
        </Alert>
      )}
      {error ||
        (getComponentError('phoneNumber') && (
          <FieldsetErrorMessage
            errorMessage={(error as string) || getComponentError('phoneNumber')}
            className={styles.error}
          />
        ))}
    </>
  );
};
export default PhoneNumber;
