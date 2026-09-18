import Identity from '../../../components/identity/Identity';
import { IdentityDefinition } from '../../component-types';
import { InputComponentProps, resolveSubmissionPath } from '../../inputComponentUtils';

const InputIdentity = ({ component, submissionPath }: InputComponentProps<IdentityDefinition>) => (
  <Identity
    statePath={resolveSubmissionPath(component, submissionPath)}
    customLabels={component.customLabels}
    prefillValue={typeof component.prefillValue === 'string' ? component.prefillValue : undefined}
    required={component.validate?.required ?? true}
    readOnly={component.readOnly}
  />
);

export default InputIdentity;
