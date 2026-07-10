import Identity from '../../../components/identity/Identity';
import { InputComponentProps, isRequired, resolveSubmissionPath } from '../../inputComponentRegistryUtils';

const InputIdentity = ({ component, submissionPath }: InputComponentProps) => (
  <Identity
    statePath={resolveSubmissionPath(component, submissionPath)}
    label={component.label}
    required={isRequired(component)}
    readOnly={component.readOnly}
  />
);

export default InputIdentity;
