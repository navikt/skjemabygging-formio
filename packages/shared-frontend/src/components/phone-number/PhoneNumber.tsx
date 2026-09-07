import { Label } from '@navikt/ds-react';
import { ComponentValue, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useEffect } from 'react';
import { useApplication } from '../../context/application/ApplicationContext';
import { useRuntimeServices } from '../../context/runtime-services/RuntimeServicesContext';
import { useStateField } from '../../context/state/useStateField';
import Alert from '../alert/Alert';
import Select from '../select/Select';
import { useRemoteOptions } from '../select/useRemoteOptions';
import FormElementBox from '../shared/FormElementBox';
import TranslatedDescription from '../shared/TranslatedDescription';
import TranslatedLabel from '../shared/TranslatedLabel';
import InternalTextField from '../text-field/InternalTextField';
import { BaseFieldProps, PhoneNumberValidation } from '../types';
import { DEFAULT_AREA_CODE, PhoneNumberValue, toPhoneNumberRules } from './phoneNumberValidation';

const fallbackAreaCodeOptions: ComponentValue[] = [{ value: DEFAULT_AREA_CODE, label: DEFAULT_AREA_CODE }];

interface PhoneNumberProps extends BaseFieldProps {
  label: string;
  showAreaCode?: boolean;
  validation?: PhoneNumberValidation;
}

const PhoneNumber = ({
  statePath,
  label,
  description,
  required = false,
  readOnly,
  readMore,
  fieldSize,
  marginBottom,
  showAreaCode = false,
  validation,
}: PhoneNumberProps) => {
  const { logger } = useApplication();
  const { formData } = useRuntimeServices();
  const { stateValue, setStateValue } = useStateField({ statePath });
  const phoneNumberValue =
    typeof stateValue === 'object' && stateValue !== null ? (stateValue as PhoneNumberValue) : undefined;
  const selectedAreaCode = phoneNumberValue?.areaCode;
  const loadAreaCodes = useCallback(() => formData.getCodeList('areaCodes'), [formData]);
  const { values: loadedAreaCodes, error } = useRemoteOptions(showAreaCode ? loadAreaCodes : undefined);

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
      error: error.message,
    });
  }, [error, logger, statePath]);

  if (!showAreaCode) {
    return (
      <InternalTextField
        statePath={statePath}
        label={label}
        description={description}
        required={required}
        readOnly={readOnly}
        readMore={readMore}
        fieldSize={fieldSize}
        marginBottom={marginBottom}
        type="tel"
        inputMode="tel"
        formatKey="phoneNumber"
        validation={toPhoneNumberRules(false, undefined, validation)}
      />
    );
  }

  const areaCodeOptions = loadedAreaCodes ?? fallbackAreaCodeOptions;

  return (
    <FormElementBox fieldSize={fieldSize} marginBottom={marginBottom}>
      <Label as="p" aria-hidden>
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
      <InternalTextField
        key={selectedAreaCode}
        statePath={`${statePath}.number`}
        label={label}
        hideLabel
        required={required}
        readOnly={readOnly}
        readMore={readMore}
        type="tel"
        inputMode="tel"
        formatKey={
          (selectedAreaCode ?? DEFAULT_AREA_CODE) === DEFAULT_AREA_CODE ? 'norwegianPhoneNumber' : 'phoneNumber'
        }
        validation={toPhoneNumberRules(true, selectedAreaCode, validation)}
      />
      {error && <Alert variant="warning">{TEXTS.statiske.phoneNumber.fetchError}</Alert>}
    </FormElementBox>
  );
};

export default PhoneNumber;
export type { PhoneNumberProps };
