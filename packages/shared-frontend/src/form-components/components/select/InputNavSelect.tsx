import Select from '../../../components/select/Select';
import { NavSelectDefinition } from '../../component-types';
import { useResolvedValidation } from '../../custom-validation/useResolvedValidation';
import {
  InputComponentProps,
  getValues,
  isRequired,
  resolveFieldSize,
  resolveReadMore,
  resolveSelectType,
  resolveSubmissionPath,
} from '../../inputComponentUtils';

const InputNavSelect = ({ component, submissionPath }: InputComponentProps<NavSelectDefinition>) => {
  const validation = useResolvedValidation(component);
  return (
    <Select
      statePath={resolveSubmissionPath(component, submissionPath)}
      label={component.label}
      description={component.description}
      values={getValues(component)}
      fieldSize={resolveFieldSize(component)}
      valueType="option"
      required={isRequired(component)}
      readOnly={component.readOnly}
      readMore={resolveReadMore(component)}
      selectType={resolveSelectType(component)}
      onlyAvailableOptions={component.validate?.onlyAvailableItems}
      validation={validation}
    />
  );
};

export default InputNavSelect;
