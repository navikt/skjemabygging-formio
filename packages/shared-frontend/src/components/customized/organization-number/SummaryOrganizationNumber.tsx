import { DefaultAnswer } from '../../shared/form-summary';
import { FormComponentProps } from '../../types';
import { formatOrganizationNumber } from './organizationNumberUtils';

const SummaryOrganizationNumber = (props: FormComponentProps) => {
  return <DefaultAnswer {...props} valueFormat={formatOrganizationNumber} />;
};

export default SummaryOrganizationNumber;
