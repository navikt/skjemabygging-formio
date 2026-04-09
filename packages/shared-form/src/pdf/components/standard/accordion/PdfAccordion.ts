import { PdfData } from '@navikt/skjemadigitalisering-shared-domain';
import { PdfComponentProps } from '../../../types';
import DefaultAnswer from '../../shared/pdf/DefaultAnswer';

const PdfAccordion = (props: PdfComponentProps): PdfData | null => {
  return DefaultAnswer(props);
};

export default PdfAccordion;
