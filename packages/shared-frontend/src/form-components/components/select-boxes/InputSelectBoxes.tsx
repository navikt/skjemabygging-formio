import CheckboxGroup from '../../../components/checkbox-group/CheckboxGroup';
import { useFieldBinding } from '../../../context/state/useFieldBinding';
import { SelectBoxesDefinition } from '../../component-types';
import { useResolvedValidation } from '../../custom-validation/useResolvedValidation';
import {
  InputComponentProps,
  getValues,
  isRequired,
  resolveFieldSize,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentUtils';
import { getSelectedValuesAsList, getSelectedValuesMap } from '../../shared/selectedValuesUtils';

const InputSelectBoxes = ({ component, submissionPath }: InputComponentProps<SelectBoxesDefinition>) => {
  const statePath = resolveSubmissionPath(component, submissionPath);
  const values = getValues(component);
  const validation = useResolvedValidation(component);
  const { stateValue, setStateValue } = useFieldBinding({ statePath });

  return (
    <CheckboxGroup
      statePath={statePath}
      legend={component.label}
      description={component.description}
      values={values}
      value={getSelectedValuesAsList(stateValue as Record<string, boolean> | undefined)}
      onChange={(selectedValues) => setStateValue(getSelectedValuesMap(values, selectedValues))}
      required={isRequired(component)}
      fieldSize={resolveFieldSize(component)}
      readMore={resolveReadMore(component)}
      validation={validation}
    />
  );
};

export default InputSelectBoxes;
