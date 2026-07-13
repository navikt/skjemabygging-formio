import Activities from '../../../components/activities/Activities';
import { InputComponentProps, resolveReadMore, resolveSubmissionPath } from '../../inputComponentRegistryUtils';

const InputActivities = ({ component, submissionPath }: InputComponentProps) => (
  <Activities
    statePath={resolveSubmissionPath(component, submissionPath)}
    label={component.label}
    description={component.description}
    readMore={resolveReadMore(component)}
  />
);

export default InputActivities;
