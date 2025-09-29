import { FormComponentProps } from '../../../types';
import DefaultSelectAnswer from '../../shared/form-summary/DefaultSelectAnswer';

const SummaryCountrySelect = ({ component, submissionPath }: FormComponentProps) => {
  return <DefaultSelectAnswer component={component} submissionPath={submissionPath} />;
};

export default SummaryCountrySelect;
