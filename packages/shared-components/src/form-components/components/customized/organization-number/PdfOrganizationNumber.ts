import { formatOrganizationNumber } from '@navikt/skjemadigitalisering-shared-domain';
import { PdfComponentProps } from '../../../types';
import DefaultAnswer from '../../shared/pdf/DefaultAnswer';

const PdfOrganizationNumber = (props: PdfComponentProps) => {
  return DefaultAnswer(props, formatOrganizationNumber);
};

export default PdfOrganizationNumber;
