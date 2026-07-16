import Identity from '../../../components/identity/Identity';
import { InputComponentProps, isRequired, resolveSubmissionPath } from '../../inputComponentRegistryUtils';

const InputIdentity = ({ component, submissionPath }: InputComponentProps) => (
  <Identity
    statePath={resolveSubmissionPath(component, submissionPath)}
    customLabels={component.customLabels}
    prefillValue={component.prefillValue}
    required={isRequired(component)}
    readOnly={component.readOnly}
  />
);

export default InputIdentity;
