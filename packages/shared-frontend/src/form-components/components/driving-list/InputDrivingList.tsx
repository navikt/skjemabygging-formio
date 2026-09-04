import DrivingList from '../../../components/driving-list/DrivingList';
import { DrivingListDefinition } from '../../component-types';
import { InputComponentProps, resolveReadMore, resolveSubmissionPath } from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const InputDrivingList = ({ component, submissionPath }: InputComponentProps<DrivingListDefinition>) => (
  <FormGroup>
    <DrivingList
      statePath={resolveSubmissionPath(component, submissionPath)}
      description={component.description}
      readMore={resolveReadMore(component)}
    />
  </FormGroup>
);

export default InputDrivingList;
