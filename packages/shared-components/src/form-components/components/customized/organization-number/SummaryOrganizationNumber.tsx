import { FormComponentProps } from '../../../types';
import { DefaultAnswer } from '../../shared/form-summary';
import { formatOrganizationNumber } from './organizationNumberUtils';

const SummaryOrganizationNumber = ({ component, submissionPath }: FormComponentProps) => {
  return <DefaultAnswer component={component} submissionPath={submissionPath} valueFormat={formatOrganizationNumber} />;
};

export default SummaryOrganizationNumber;
