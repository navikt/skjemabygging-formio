import { useEffect } from 'react';
import Select from '../../../components/select/Select';
import { useRemoteOptions } from '../../../components/select/useRemoteOptions';
import { useAppConfig } from '../../../context/app-config/AppConfigContext';
import {
  getValues,
  InputComponentProps,
  isRequired,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';

const CURRENCY_OPTIONS_URL = '/fyllut/api/common-codes/currencies';

const InputCurrencySelect = ({ component, submissionPath }: InputComponentProps) => {
  const { logger } = useAppConfig();
  const fallbackValues = getValues(component);
  const { values: loadedValues, error } = useRemoteOptions(CURRENCY_OPTIONS_URL);

  useEffect(() => {
    if (!error) {
      return;
    }

    logger?.error?.('Failed to load currency select options', {
      componentKey: component.key,
      url: CURRENCY_OPTIONS_URL,
      error: error.message,
    });
  }, [component.key, error, logger]);

  const values = loadedValues ?? fallbackValues;

  if (!values) {
    return null;
  }

  return (
    <Select
      statePath={resolveSubmissionPath(component, submissionPath)}
      label={component.label}
      description={component.description}
      values={values}
      required={isRequired(component)}
      readMore={resolveReadMore(component)}
      selectType="combobox"
    />
  );
};

export default InputCurrencySelect;
