import { formatUtils } from '@navikt/skjemadigitalisering-shared-domain';
import DefaultAnswer from '../../shared/PdfDefaultAnswer';
import { PdfComponentProps } from '../../types';

const PdfIban = (props: PdfComponentProps) => {
  return DefaultAnswer(props, formatUtils.formatIBAN);
};

export default PdfIban;
