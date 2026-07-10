import CheckboxGroup from '../../../components/checkbox-group/CheckboxGroup';
import { getValues, InputComponentProps, isRequired, resolveSubmissionPath } from '../../inputComponentRegistryUtils';

const InputSelectBoxes = ({ component, submissionPath }: InputComponentProps) => (
  <CheckboxGroup
    statePath={resolveSubmissionPath(component, submissionPath)}
    legend={component.label}
    description={component.description}
    values={getValues(component)}
    required={isRequired(component)}
  />
);

export default InputSelectBoxes;
