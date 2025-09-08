import { FormComponentProps } from '../../../types';
import { DefaultAnswer } from '../../shared/form-summary';

const SummaryFirstName = ({ component, submissionPath }: FormComponentProps) => {
  return <DefaultAnswer component={component} submissionPath={submissionPath} />;
};

export default SummaryFirstName;
