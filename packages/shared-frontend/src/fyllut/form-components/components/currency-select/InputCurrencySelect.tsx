import { useEffect } from 'react';
import Select from '../../../../components/select/Select';
import { useRemoteOptions } from '../../../../components/select/useRemoteOptions';
import { useApplication } from '../../../../context/application/ApplicationContext';
import {
  getValues,
  InputComponentProps,
  isRequired,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const CURRENCY_OPTIONS_URL = '/fyllut/api/common-codes/currencies';

const InputCurrencySelect = ({ component, submissionPath }: InputComponentProps) => {
  const { logger } = useApplication();
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
    <FormGroup>
      <Select
        statePath={resolveSubmissionPath(component, submissionPath)}
        label={component.label}
        description={component.description}
        values={values}
        required={isRequired(component)}
        readMore={resolveReadMore(component)}
        selectType="combobox"
        valueType="option"
      />
    </FormGroup>
  );
};

export default InputCurrencySelect;
