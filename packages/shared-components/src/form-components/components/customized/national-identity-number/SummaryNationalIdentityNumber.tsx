import { FormComponentProps } from '../../../types';
import { DefaultAnswer } from '../../shared/form-summary';

const SummaryNationalIdentityNumber = ({ component, submissionPath }: FormComponentProps) => {
  return <DefaultAnswer component={component} submissionPath={submissionPath} />;
};

export default SummaryNationalIdentityNumber;
