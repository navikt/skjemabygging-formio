import CheckboxGroup from '../../../components/checkbox-group/CheckboxGroup';
import { getSelectedValuesAsList, getSelectedValuesMap } from '../../../components/data-fetcher/dataFetcherUtils';
import { useStateField } from '../../../context/state/useStateField';
import {
  getValues,
  InputComponentProps,
  isRequired,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';

const InputSelectBoxes = ({ component, submissionPath }: InputComponentProps) => {
  const statePath = resolveSubmissionPath(component, submissionPath);
  const values = getValues(component);
  const { stateValue, error, setStateValue } = useStateField({ statePath });

  return (
    <CheckboxGroup
      statePath={statePath}
      legend={component.label}
      description={component.description}
      values={values}
      value={getSelectedValuesAsList(stateValue as Record<string, boolean> | undefined)}
      onChange={(selectedValues) => setStateValue(getSelectedValuesMap(values, selectedValues))}
      error={error}
      required={isRequired(component)}
      readMore={resolveReadMore(component)}
    />
  );
};

export default InputSelectBoxes;
