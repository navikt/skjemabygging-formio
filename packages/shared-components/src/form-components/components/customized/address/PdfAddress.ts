import { addressToString } from '@navikt/skjemadigitalisering-shared-domain';
import { PdfComponentProps } from '../../../types';
import DefaultAnswer from '../../shared/pdf/DefaultAnswer';

const PdfAddress = (props: PdfComponentProps) => {
  return DefaultAnswer(props, addressToString);
};

export default PdfAddress;
