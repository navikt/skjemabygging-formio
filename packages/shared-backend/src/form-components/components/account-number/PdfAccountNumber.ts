import { formatUtils } from '@navikt/skjemadigitalisering-shared-domain';
import DefaultAnswer from '../../shared/PdfDefaultAnswer';
import { PdfComponentProps } from '../../types';

const PdfAccountNumber = (props: PdfComponentProps) => {
  return DefaultAnswer(props, formatUtils.formatAccountNumber);
};

export default PdfAccountNumber;
