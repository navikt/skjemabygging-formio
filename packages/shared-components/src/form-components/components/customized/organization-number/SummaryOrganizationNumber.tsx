import { FormComponentProps } from '../../../types';
import { DefaultAnswer } from '../../shared/form-summary';
import { formatOrganizationNumber } from './organizationNumberUtils';

const SummaryOrganizationNumber = (props: FormComponentProps) => {
  return <DefaultAnswer {...props} valueFormat={formatOrganizationNumber} />;
};

export default SummaryOrganizationNumber;
