import { useCallback, useEffect } from 'react';
import Select from '../../../components/select/Select';
import { useRemoteOptions } from '../../../components/select/useRemoteOptions';
import { useApplication } from '../../../context/application/ApplicationContext';
import { useRuntimeServices } from '../../../context/runtime-services/RuntimeServicesContext';
import {
  getValues,
  InputComponentProps,
  isRequired,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const InputCurrencySelect = ({ component, submissionPath }: InputComponentProps) => {
  const { logger } = useApplication();
  const { formData } = useRuntimeServices();
  const fallbackValues = getValues(component);
  const loadCurrencies = useCallback(() => formData.getCodeList('currencies'), [formData]);
  const { values: loadedValues, error } = useRemoteOptions(loadCurrencies);

  useEffect(() => {
    if (!error) {
      return;
    }

    logger?.error?.('Failed to load currency select options', {
      componentKey: component.key,
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
