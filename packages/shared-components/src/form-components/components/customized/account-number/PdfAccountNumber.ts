import { formatUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { PdfComponentProps } from '../../../types';
import DefaultAnswer from '../../shared/pdf/DefaultAnswer';

const PdfAccountNumber = (props: PdfComponentProps) => {
  return DefaultAnswer(props, formatUtils.formatAccountNumber);
};

export default PdfAccountNumber;
