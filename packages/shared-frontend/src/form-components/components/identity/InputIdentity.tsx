import Identity from '../../../components/identity/Identity';
import { InputComponentProps, isRequired, resolveSubmissionPath } from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const InputIdentity = ({ component, submissionPath }: InputComponentProps) => (
  <FormGroup>
    <Identity
      statePath={resolveSubmissionPath(component, submissionPath)}
      customLabels={component.customLabels}
      prefillValue={typeof component.prefillValue === 'string' ? component.prefillValue : undefined}
      required={isRequired(component)}
      readOnly={component.readOnly}
    />
  </FormGroup>
);

export default InputIdentity;
