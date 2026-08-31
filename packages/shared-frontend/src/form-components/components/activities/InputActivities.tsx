import Activities from '../../../components/activities/Activities';
import { ActivitiesDefinition } from '../../component-types';
import { InputComponentProps, resolveReadMore, resolveSubmissionPath } from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const InputActivities = ({ component, submissionPath }: InputComponentProps<ActivitiesDefinition>) => (
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
