import Activities from '../../../../components/activities/Activities';
import { InputComponentProps, resolveReadMore, resolveSubmissionPath } from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const InputActivities = ({ component, submissionPath }: InputComponentProps) => (
  <FormGroup>
    <Activities
      statePath={resolveSubmissionPath(component, submissionPath)}
      label={component.label}
      description={component.description}
      readMore={resolveReadMore(component)}
    />
  </FormGroup>
);

export default InputActivities;
