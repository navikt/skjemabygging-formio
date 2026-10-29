import { Label } from '@navikt/ds-react';
import { ComponentValue, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useEffect } from 'react';
import { useApplication } from '../../context/application/ApplicationContext';
import { useLanguage } from '../../context/language/LanguageContext';
import { useRuntimeServices } from '../../context/runtime-services/RuntimeServicesContext';
import { useFieldBinding } from '../../context/state/useFieldBinding';
import { inputId } from '../../utils/inputId';
import Alert from '../alert/Alert';
import Select from '../select/Select';
import { useRemoteOptions } from '../select/useRemoteOptions';
import FieldError from '../shared/FieldError';
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
  autoComplete?: string;
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
  autoComplete,
  validation,
}: PhoneNumberProps) => {
  const { logger } = useApplication();
  const { translate } = useLanguage();
  const { formData } = useRuntimeServices();
  const { stateValue, setStateValue } = useFieldBinding({ statePath });
  const { error: numberError } = useFieldBinding({ statePath: `${statePath}.number` });
  const visibleNumberError = readOnly ? undefined : numberError;
  const numberErrorId = `${inputId(statePath)}-group-error`;
  const phoneNumberValue =
    typeof stateValue === 'object' && stateValue !== null ? (stateValue as PhoneNumberValue) : undefined;
  const selectedAreaCode = phoneNumberValue?.areaCode;
  const displayedAreaCode = selectedAreaCode || DEFAULT_AREA_CODE;
  const loadAreaCodes = useCallback(() => formData.getCodeList('areaCodes'), [formData]);
  const { values: loadedAreaCodes, error } = useRemoteOptions(showAreaCode ? loadAreaCodes : undefined);

  useEffect(() => {
    if (!showAreaCode) {
      return;
    }

    // The selector shows the default area code without storing it, so an untouched field has no answer.
    if (typeof stateValue === 'string') {
      if (stateValue) {
        setStateValue({ areaCode: DEFAULT_AREA_CODE, number: stateValue });
      }
      return;
    }

    if (phoneNumberValue?.number && !phoneNumberValue.areaCode) {
      setStateValue({ ...phoneNumberValue, areaCode: DEFAULT_AREA_CODE });
    }
  }, [phoneNumberValue, setStateValue, showAreaCode, stateValue]);

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
        autoComplete={autoComplete}
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
        <div className={displayedAreaCode.length > 3 ? `${styles.areaCode} ${styles.areaCodeLong}` : styles.areaCode}>
          <Select
            statePath={`${statePath}.areaCode`}
            label={TEXTS.statiske.phoneNumber.areaCodeLabel}
            hideLabel
            values={areaCodeOptions}
            value={displayedAreaCode}
            onChange={(areaCode) => setStateValue({ ...phoneNumberValue, areaCode })}
            required={false}
            readOnly={readOnly}
            selectType="select"
            marginBottom="space-0"
          />
        </div>
        <FormElementBox fieldSize={fieldSize} marginBottom="space-0" className={styles.number}>
          <InternalTextField
            key={displayedAreaCode}
            statePath={`${statePath}.number`}
            label={label}
            hideLabel
            showInlineError={false}
            aria-describedby={visibleNumberError ? numberErrorId : undefined}
            marginBottom="space-0"
            required={required}
            readOnly={readOnly}
            readMore={readMore}
            type="tel"
            autoComplete={autoComplete}
            inputMode="tel"
            formatKey={displayedAreaCode === DEFAULT_AREA_CODE ? 'norwegianPhoneNumber' : 'phoneNumber'}
            validation={toPhoneNumberRules(true, selectedAreaCode, validation)}
          />
        </FormElementBox>
      </div>
      <FieldError id={numberErrorId} error={visibleNumberError} className={styles.error} />
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
