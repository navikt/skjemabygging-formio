import { FormComponentProps } from '../../../types';
import DefaultObjectAnswer from '../../shared/form-summary/DefaultObjectAnswer';

const SummaryCountrySelect = ({ component, submissionPath }: FormComponentProps) => {
  return <DefaultObjectAnswer component={component} submissionPath={submissionPath} />;
};

export default SummaryCountrySelect;
