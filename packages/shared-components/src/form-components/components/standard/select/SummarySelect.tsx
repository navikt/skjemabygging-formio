import { FormComponentProps } from '../../../types';
import DefaultSelectAnswer from '../../shared/form-summary/DefaultSelectAnswer';

const SummarySelect = ({ component, submissionPath }: FormComponentProps) => {
  return <DefaultSelectAnswer component={component} submissionPath={submissionPath} />;
};

export default SummarySelect;
