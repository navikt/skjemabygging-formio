import { formatUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { PdfComponentProps } from '../../../types';
import DefaultAnswer from '../../shared/pdf/DefaultAnswer';

const PdfIban = (props: PdfComponentProps) => {
  return DefaultAnswer(props, formatUtils.formatIBAN);
};

export default PdfIban;
