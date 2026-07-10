import RadioGroup from '../../../components/radio-group/RadioGroup';
import { getValues, InputComponentProps, isRequired, resolveSubmissionPath } from '../../inputComponentRegistryUtils';

const InputRadio = ({ component, submissionPath }: InputComponentProps) => (
  <RadioGroup
    statePath={resolveSubmissionPath(component, submissionPath)}
    legend={component.label}
    description={component.description}
    values={getValues(component)}
    required={isRequired(component)}
    readOnly={component.readOnly}
  />
);

export default InputRadio;
