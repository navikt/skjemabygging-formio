import DrivingList from '../../../components/driving-list/DrivingList';
import { InputComponentProps, resolveReadMore, resolveSubmissionPath } from '../../inputComponentRegistryUtils';

const InputDrivingList = ({ component, submissionPath }: InputComponentProps) => (
  <DrivingList
    statePath={resolveSubmissionPath(component, submissionPath)}
    description={component.description}
    readMore={resolveReadMore(component)}
  />
);

export default InputDrivingList;
