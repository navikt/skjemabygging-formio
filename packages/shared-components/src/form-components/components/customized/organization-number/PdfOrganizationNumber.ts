import { PdfComponentProps } from '../../../types';
import DefaultAnswer from '../../shared/pdf/DefaultAnswer';
import { formatOrganizationNumber } from './organizationNumberUtils';

const PdfOrganizationNumber = (props: PdfComponentProps) => {
  return DefaultAnswer(props, formatOrganizationNumber);
};

export default PdfOrganizationNumber;
