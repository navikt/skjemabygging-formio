import { PdfData } from '@navikt/skjemadigitalisering-shared-domain';
import DefaultAnswer from '../../shared/PdfDefaultAnswer';
import { PdfComponentProps } from '../../types';

const PdfAccordion = (props: PdfComponentProps): PdfData | null => {
  return DefaultAnswer(props);
};

export default PdfAccordion;
