import Select from '../../../components/select/Select';
import { getValues, InputComponentProps, isRequired, resolveSubmissionPath } from '../../inputComponentRegistryUtils';

const InputCountrySelect = ({ component, submissionPath }: InputComponentProps) => (
  <Select
    statePath={resolveSubmissionPath(component, submissionPath)}
    label={component.label}
    description={component.description}
    values={getValues(component)}
    required={isRequired(component)}
  />
);

export default InputCountrySelect;
