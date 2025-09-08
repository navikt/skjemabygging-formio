import { FormComponentProps } from '../../../types';
import DefaultObjectAnswer from '../../shared/form-summary/DefaultObjectAnswer';

const SummaryCurrencySelect = ({ component, submissionPath }: FormComponentProps) => {
  return <DefaultObjectAnswer component={component} submissionPath={submissionPath} />;
};

export default SummaryCurrencySelect;
