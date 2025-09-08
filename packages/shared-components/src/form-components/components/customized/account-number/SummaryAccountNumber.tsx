import { FormComponentProps } from '../../../types';
import { DefaultAnswer } from '../../shared/form-summary';

const SummaryAccountNumber = ({ component, submissionPath }: FormComponentProps) => {
  return <DefaultAnswer component={component} submissionPath={submissionPath} />;
};

export default SummaryAccountNumber;
