import DrivingList from '../../../../components/driving-list/DrivingList';
import { InputComponentProps, resolveReadMore, resolveSubmissionPath } from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const InputDrivingList = ({ component, submissionPath }: InputComponentProps) => (
  <FormGroup>
    <DrivingList
      statePath={resolveSubmissionPath(component, submissionPath)}
      description={component.description}
      readMore={resolveReadMore(component)}
    />
  </FormGroup>
);

export default InputDrivingList;
