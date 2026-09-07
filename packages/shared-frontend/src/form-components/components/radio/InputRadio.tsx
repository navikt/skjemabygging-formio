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
} from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const InputRadio = ({ component, submissionPath }: InputComponentProps<RadioPanelDefinition>) => {
  const validation = useResolvedValidation(component);
  return (
    <FormGroup>
      <RadioGroup
        statePath={resolveSubmissionPath(component, submissionPath)}
        legend={component.label}
        description={component.description}
        values={getValues(component)}
        defaultValue={typeof component.defaultValue === 'string' ? component.defaultValue : undefined}
        required={isRequired(component)}
        fieldSize={resolveFieldSize(component)}
        readOnly={component.readOnly}
        readMore={resolveReadMore(component)}
        onlyAvailableOptions={component.validate?.onlyAvailableItems}
        validation={validation}
      />
    </FormGroup>
  );
};

export default InputRadio;
