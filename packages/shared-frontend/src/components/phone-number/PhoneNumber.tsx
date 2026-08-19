import { Label } from '@navikt/ds-react';
import { ComponentValue, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect } from 'react';
import { useApplication } from '../../context/application/ApplicationContext';
import { useLanguage } from '../../context/language/LanguageContext';
import { useStateField } from '../../context/state/useStateField';
import { inputId } from '../../utils/inputId';
import Alert from '../alert/Alert';
import Select from '../select/Select';
import { useRemoteOptions } from '../select/useRemoteOptions';
import FormElementBox from '../shared/FormElementBox';
import TranslatedDescription from '../shared/TranslatedDescription';
import TranslatedLabel from '../shared/TranslatedLabel';
import TextField from '../text-field/TextField';
import { BaseFieldProps } from '../types';

const DEFAULT_AREA_CODE = '+47';
const AREA_CODE_OPTIONS_URL = '/fyllut/api/common-codes/area-codes';
const fallbackAreaCodeOptions: ComponentValue[] = [{ value: DEFAULT_AREA_CODE, label: DEFAULT_AREA_CODE }];

interface PhoneNumberValue {
  areaCode?: string;
  number?: string;
}

interface PhoneNumberProps extends BaseFieldProps {
  label: string;
  showAreaCode?: boolean;
}

const PhoneNumber = ({
  statePath,
  label,
  description,
  required = false,
  readOnly,
  readMore,
  showAreaCode = false,
}: PhoneNumberProps) => {
  const { logger } = useApplication();
  const { translate } = useLanguage();
  const { stateValue, setStateValue } = useStateField({ statePath });
  const phoneNumberValue =
    typeof stateValue === 'object' && stateValue !== null ? (stateValue as PhoneNumberValue) : undefined;
  const areaCode = phoneNumberValue?.areaCode ?? DEFAULT_AREA_CODE;
  const { values: loadedAreaCodes, error } = useRemoteOptions(showAreaCode ? AREA_CODE_OPTIONS_URL : undefined);

  useEffect(() => {
    if (!showAreaCode || phoneNumberValue?.areaCode) {
      return;
    }

    setStateValue({
      areaCode: DEFAULT_AREA_CODE,
      number: typeof stateValue === 'string' ? stateValue : (phoneNumberValue?.number ?? ''),
    });
  }, [phoneNumberValue?.areaCode, phoneNumberValue?.number, setStateValue, showAreaCode, stateValue]);

  useEffect(() => {
    if (!error) {
      return;
    }

    logger?.error?.('Failed to load phone number area codes', {
      statePath,
      url: AREA_CODE_OPTIONS_URL,
      error: error.message,
    });
  }, [error, logger, statePath]);

  if (!showAreaCode) {
    return (
      <TextField
        statePath={statePath}
        label={label}
        description={description}
        required={required}
        readOnly={readOnly}
        readMore={readMore}
        type="tel"
        inputMode="tel"
        formatKey="phoneNumber"
      />
    );
  }

  const areaCodeOptions = loadedAreaCodes ?? fallbackAreaCodeOptions;

  return (
    <FormElementBox>
      <Label as="label" htmlFor={inputId(`${statePath}.number`)}>
        <TranslatedLabel required={required} readOnly={readOnly}>
          {label}
        </TranslatedLabel>
      </Label>
      <TranslatedDescription>{description}</TranslatedDescription>
      <Select
        statePath={`${statePath}.areaCode`}
        label={TEXTS.statiske.phoneNumber.areaCodeLabel}
        hideLabel
        values={areaCodeOptions}
        required={false}
        readOnly={readOnly}
        selectType="combobox"
      />
      <TextField
        key={areaCode}
        statePath={`${statePath}.number`}
        label={translate(TEXTS.statiske.phoneNumber.phoneNumberLabel)}
        hideLabel
        required={required}
        readOnly={readOnly}
        readMore={readMore}
        type="tel"
        inputMode="tel"
        formatKey={areaCode === DEFAULT_AREA_CODE ? 'norwegianPhoneNumber' : 'phoneNumber'}
      />
      {error && <Alert variant="warning">{TEXTS.statiske.phoneNumber.fetchError}</Alert>}
    </FormElementBox>
  );
};

export default PhoneNumber;
export type { PhoneNumberProps };
