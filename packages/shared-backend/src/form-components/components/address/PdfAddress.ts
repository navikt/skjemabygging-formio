import { addressToString } from '@navikt/skjemadigitalisering-shared-domain';
import DefaultAnswer from '../../shared/PdfDefaultAnswer';
import { PdfComponentProps } from '../../types';

const PdfAddress = (props: PdfComponentProps) => {
  return DefaultAnswer(props, addressToString);
};

export default PdfAddress;
