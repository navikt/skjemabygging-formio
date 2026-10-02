import RadioGroup from '../../../components/radio-group/RadioGroup';
import { RadioPanelDefinition } from '../../component-types';
import { useResolvedValidation } from '../../custom-validation/useResolvedValidation';
import {
  InputComponentProps,
  getValues,
  isRequired,
  resolveFieldSize,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentUtils';

const InputRadio = ({ component, submissionPath }: InputComponentProps<RadioPanelDefinition>) => {
  const validation = useResolvedValidation(component);
  return (
    <RadioGroup
      statePath={resolveSubmissionPath(component, submissionPath)}
      legend={component.label}
      description={component.description}
      values={getValues(component)}
      required={isRequired(component)}
      fieldSize={resolveFieldSize(component)}
      readOnly={component.readOnly}
      readMore={resolveReadMore(component)}
      onlyAvailableOptions={component.validate?.onlyAvailableItems}
      validation={validation}
    />
  );
};

export default InputRadio;
