import { Label } from '@navikt/ds-react';
import { ComponentValue, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useEffect } from 'react';
import { useApplication } from '../../context/application/ApplicationContext';
import { useLanguage } from '../../context/language/LanguageContext';
import { useRuntimeServices } from '../../context/runtime-services/RuntimeServicesContext';
import { useFieldBinding } from '../../context/state/useFieldBinding';
import Alert from '../alert/Alert';
import Select from '../select/Select';
import { useRemoteOptions } from '../select/useRemoteOptions';
import FormElementBox from '../shared/FormElementBox';
import TranslatedDescription from '../shared/TranslatedDescription';
import TranslatedLabel from '../shared/TranslatedLabel';
import InternalTextField from '../text-field/InternalTextField';
import { BaseFieldProps, PhoneNumberValidation } from '../types';
import styles from './PhoneNumber.module.css';
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
  const { translate } = useLanguage();
  const { formData } = useRuntimeServices();
  const { stateValue, setStateValue } = useFieldBinding({ statePath });
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
    <FormElementBox marginBottom={marginBottom}>
      <Label as="div" className={styles.label} aria-hidden>
        <TranslatedLabel required={required} readOnly={readOnly} translationKey={label} />
      </Label>
      {description && (
        <div className={styles.description}>
          <TranslatedDescription translationKey={description} />
        </div>
      )}
      <div className={styles.controls}>
        <div
          className={
            (selectedAreaCode ?? DEFAULT_AREA_CODE).length > 3
              ? `${styles.areaCode} ${styles.areaCodeLong}`
              : styles.areaCode
          }
        >
          <Select
            statePath={`${statePath}.areaCode`}
            label={TEXTS.statiske.phoneNumber.areaCodeLabel}
            hideLabel
            values={areaCodeOptions}
            required={false}
            readOnly={readOnly}
            selectType="select"
            marginBottom="space-0"
          />
        </div>
        <FormElementBox fieldSize={fieldSize} marginBottom="space-0" className={styles.number}>
          <InternalTextField
            key={selectedAreaCode}
            statePath={`${statePath}.number`}
            label={label}
            hideLabel
            marginBottom="space-0"
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
        </FormElementBox>
      </div>
      {error && (
        <Alert variant="warning" marginBottom="space-0">
          {translate(TEXTS.statiske.phoneNumber.fetchError)}
        </Alert>
      )}
    </FormElementBox>
  );
};

export default PhoneNumber;
export type { PhoneNumberProps };
