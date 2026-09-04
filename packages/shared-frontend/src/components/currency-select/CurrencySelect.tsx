import { useCallback, useEffect } from 'react';
import { useApplication } from '../../context/application/ApplicationContext';
import { useRuntimeServices } from '../../context/runtime-services/RuntimeServicesContext';
import Select from '../select/Select';
import { useRemoteOptions } from '../select/useRemoteOptions';
import { BaseFieldProps } from '../types';

interface CurrencySelectProps extends BaseFieldProps {
  label: string;
}

const CurrencySelect = ({
  statePath,
  label,
  description,
  required,
  readOnly,
  readMore,
  fieldSize,
  marginBottom,
}: CurrencySelectProps) => {
  const { logger } = useApplication();
  const { formData } = useRuntimeServices();
  const loadCurrencies = useCallback(() => formData.getCodeList('currencies'), [formData]);
  const { values: loadedValues, error } = useRemoteOptions(loadCurrencies);

  useEffect(() => {
    if (error) {
      logger?.error?.('Failed to load currency select options', { statePath, error: error.message });
    }
  }, [error, logger, statePath]);

  return (
    <Select
      statePath={statePath}
      label={label}
      description={description}
      values={loadedValues ?? []}
      required={required}
      readOnly={readOnly}
      readMore={readMore}
      fieldSize={fieldSize}
      marginBottom={marginBottom}
      selectType="combobox"
      valueType="option"
    />
  );
};

export default CurrencySelect;
export type { CurrencySelectProps };
