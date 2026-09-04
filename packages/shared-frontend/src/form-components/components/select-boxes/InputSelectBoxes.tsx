import { useEffect } from 'react';
import CheckboxGroup from '../../../components/checkbox-group/CheckboxGroup';
import { getSelectedValuesAsList, getSelectedValuesMap } from '../../../components/data-fetcher/dataFetcherUtils';
import { useStateField } from '../../../context/state/useStateField';
import { SelectBoxesDefinition } from '../../component-types';
import {
  getValues,
  InputComponentProps,
  isRequired,
  resolveFieldSize,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const isSelectBoxesValue = (value: unknown): value is Record<string, boolean> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const InputSelectBoxes = ({ component, submissionPath }: InputComponentProps<SelectBoxesDefinition>) => {
  const statePath = resolveSubmissionPath(component, submissionPath);
  const values = getValues(component);
  const { stateValue, error, setStateValue } = useStateField({ statePath });
  const defaultValue = isSelectBoxesValue(component.defaultValue) ? component.defaultValue : undefined;

  useEffect(() => {
    if (stateValue !== undefined || defaultValue === undefined) {
      return;
    }

    setStateValue(defaultValue);
  }, [defaultValue, setStateValue, stateValue]);

  return (
    <FormGroup>
      <CheckboxGroup
        statePath={statePath}
        legend={component.label}
        description={component.description}
        values={values}
        value={getSelectedValuesAsList((stateValue as Record<string, boolean> | undefined) ?? defaultValue)}
        onChange={(selectedValues) => setStateValue(getSelectedValuesMap(values, selectedValues))}
        error={error}
        required={isRequired(component)}
        fieldSize={resolveFieldSize(component)}
        readMore={resolveReadMore(component)}
      />
    </FormGroup>
  );
};

export default InputSelectBoxes;
