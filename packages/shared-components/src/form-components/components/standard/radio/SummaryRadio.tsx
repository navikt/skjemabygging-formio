import { FormComponentProps } from '../../../types';
import { DefaultListAnswer } from '../../shared/form-summary';

const SummaryRadio = ({ component, submissionPath }: FormComponentProps) => {
  return <DefaultListAnswer component={component} submissionPath={submissionPath} />;
};

export default SummaryRadio;
